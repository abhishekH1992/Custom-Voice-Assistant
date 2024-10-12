const { openai, audioStreamChunkSize } = require('./openai.util');
const fs = require('fs');

const textCompletion = async(model, messages, stream = false) => {
    const response =  await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
    });
    console.log(response);
    return response;
}

const transcribeAudio = async(filePath) => {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
            stream: true
        });
        return transcription.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

const textToSpeech = async function*(text, voice='alloy') {
    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
    });
    yield* response.body;
};


const combinedStream = async function*(textStream, templateId, abortSignal, type) {
    let fullResponse = '';
    let audioBuffer = Buffer.alloc(0);
    let isLastChunk = false;
    let pendingTextStream = [];

    try {
        for await (const part of textStream) {
            if (abortSignal.aborted) {
                throw new DOMException('Stream aborted', 'AbortError');
            }
            const content = part.choices[0]?.delta?.content || '';
            fullResponse += content;
            pendingTextStream.push(content);
        }

        const audioStream = await textToSpeech(fullResponse, templateId.voice);
        const audioIterator = audioStream[Symbol.asyncIterator]();
        let isTextStreamed = false;
        let noOfIteration = 0;
        let auidoChunkSize = audioStreamChunkSize;

        while (!isLastChunk) {
            noOfIteration += 1;
            if (abortSignal.aborted) {
                throw new DOMException('Stream aborted', 'AbortError');
            }

            const { value, done } = await audioIterator.next();
            isLastChunk = done;

            if (value) {
                audioBuffer = Buffer.concat([audioBuffer, value]);
            }

            if(noOfIteration < 5) {
                auidoChunkSize = audioStreamChunkSize / 8;
            } else if(noOfIteration < 10) {
                auidoChunkSize = audioStreamChunkSize / 5;
            } else {
                auidoChunkSize = audioStreamChunkSize;
            }

            if(audioBuffer.length >= auidoChunkSize && !isTextStreamed) {
                isTextStreamed = true;
                for (const textChunk of pendingTextStream) {
                    yield {
                        messageStreamed: { role: 'system', content: textChunk, type },
                        templateId,
                    };
                }
            }

            while (audioBuffer.length >= auidoChunkSize || (isLastChunk && audioBuffer.length > 0)) {
                if (abortSignal.aborted) {
                    throw new DOMException('Stream aborted', 'AbortError');
                }

                const chunkToSend = audioBuffer.slice(0, auidoChunkSize);
                audioBuffer = audioBuffer.slice(auidoChunkSize);

                yield {
                    audioStreamed: { content: chunkToSend.toString('base64') },
                    templateId
                };

                if (isLastChunk && audioBuffer.length === 0) {
                    break;
                }
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`Stream for template ${templateId} was aborted`);
        } else {
            console.error('Error in combinedStream:', error);
        }
    } finally {
        // Perform any necessary cleanup here
    }
}

const analyzeTranscription = async (prompt, model, chats) => {
    try {
        const userMessages = chats
            .filter(message => message.role === "user")
            .map(message => message.content)
            .join("\n\n");

        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in conversation analysis. Analyze the conversation strictly in the context of the given system prompt and user messages. Provide a detailed, accurate analysis using the specified JSON format and keys."
                },
                {
                    role: "user",
                    content: `Analyze the following conversation in the context of a call center training scenario. Provide a detailed analysis in the exact JSON format specified, using the given keys. Ensure all analyses are relevant to call center and the system prompt.

                    Required JSON Structure:
                    {
                        "accentEmotionAnalysis": {
                            "accent": {
                                "key": string,
                                "rate": number
                            },
                            "emotion": {
                                "key": string,
                                "rate": number
                            }
                        },
                        "toneSentimentOverview": {
                            "tone": {
                                "key": string,
                                "rate": number
                            },
                            "sentiment": {
                                "key": string,
                                "rate": number
                            }
                        },
                        "pronunciationAnalysis": {
                            "accuracy": {
                                "key": string,
                                "rate": number
                            },
                            "clarity": {
                                "key": string,
                                "rate": number
                            },
                            "issues": {
                                "key": string,
                                "rate": number
                            }
                        },
                        "interactionSpeed": {
                            "speed": string,
                            "rate": number
                            "reflection": string
                        },
                        "fillerWordAnalysis": {
                            "fillerWords": string[],
                            "count": number
                        },
                        "loosingPromptContent": {
                            "isLosingContent": {
                                "key": string,
                                "rate": number
                            },
                            "sectionsMissed": string[]
                        },
                        "confidenceScore": {
                            "avgConfidence": number,
                            "accentEmotionAnalysis": number,
                            "toneSentimentOverview": number,
                            "emotionTimeline": number,
                            "toneSentimentTimeline": number,
                            "keywordsWithContext": number,
                            "pronunciationAnalysis": number,
                            "interactionSpeed": number,
                            "fillerWordAnalysis": number,
                            "loosingPromptContent": number
                            "awareness": number,
                            "proactive": number
                        },
                        "overview": {
                            "abstractSummary": string,
                            "keyPoints": string,
                            "actionItem": string,
                            "sentiment": number,
                            "awareness": number,
                            "proactive": number,
                        }
                    }

                    Instructions:
                    1. Strictly adhere to the JSON structure provided.
                    2. All analyses must be relevant to call center training and the system prompt.
                    3. For 'loosingPromptContent', check if the user is deviating from the call center training scenario.
                    4. All confidence scores must be between 0.5 and 5, with 5 being the highest confidence.
                    5. Ensure timestamps in timelines are consistent and relevant to the conversation flow.
                    6. Keywords should be system prompt terms from the conversation.
                    7. For accent and emotionin accentEmotionAnalysis, rate it with scores must be between 0.5 and 5, with 5 being the best.
                    8. For toneSentimentOverview, rate it with scores must be between 0.5 and 5, with 5 being the best.
                    9. For pronunciationAnalysis, rate it with scores must be between 0.5 and 5, with 5 being the best.
                    10. Don't provide response in markdown structure
                    11. Strictly remove unwanted special character or string which can break JSON.parse for this JSON

                    System Prompt:
                    ${prompt}

                    User Messages:
                    ${userMessages}`
                }
            ],
            max_tokens: 1500
        });
        const parsedResponse = safeJSONParse(response.choices[0].message.content.trim());

        return parsedResponse;
    } catch (error) {
        console.error('Error analyzing transcription:', error);
        throw error;
    }
};

const analyzeChat = async(prompt, model, chats) => {
    const userMessages = chats
            .filter(message => message.role === "user")
            .map(message => message.content)
            .join("\n\n");
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                "role": "system",
                "content": "You are an expert in conversation analysis for call center training scenarios. Analyze the following conversation and provide feedback for each user message. Use the specified JSON format."
            },
            {
                "role": "user",
                "content": `Analyze this call center training conversation. Provide feedback and ratings for user messages only. Use this exact JSON format for each message:
              
                {
                  role: 'user' or 'system',
                  content: 'The actual message content',
                  feedback: 'Constructive and short feedback for user messages',
                  rate: Number between 0.5 and 5 for user messages
                }
              
                Instructions:
                1. Provide feedback only for user messages, focusing on call center skills.
                2. Rate user messages on a scale of 0.5 to 5, where 5 is excellent.
                3. For system messages, set feedback and rate to null.
                4. Ensure all feedback is relevant to call center training.
                5. Strictly adhere to the JSON structure provided.
                6. Don't provide response in markdown structure
                7. Strictly remove unwanted special character or string which can break JSON.parse for this JSON
                8. Remove white spaces from the response from beginning and end
                9. Put response in array
                10. Response strictly be valid JSON and can be parsed successfully
              
                Conversation to analyze:
                ${JSON.stringify(userMessages)}
                
                System Prompt:
                ${prompt}`
            }
        ],
        max_tokens: 2000
    });
    const parsedResponse = safeJSONParse(response.choices[0].message.content);
    return parsedResponse;
}

const safeJSONParse = async (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        const cleanedStr = str.replace(/[\u0000-\u001F]+/g, "")
                              .replace(/\\n/g, "\\n")
                              .replace(/\\'/g, "\\'")
                              .replace(/\\"/g, '\\"')
                              .replace(/\\&/g, "\\&")
                              .replace(/\\r/g, "\\r")
                              .replace(/\\t/g, "\\t")
                              .replace(/\\b/g, "\\b")
                              .replace(/\\f/g, "\\f");
        return JSON.parse(cleanedStr);
    }
}

module.exports = { textCompletion, transcribeAudio, textToSpeech, combinedStream, analyzeTranscription, analyzeChat };