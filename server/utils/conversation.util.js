const { openai, audioStreamChunkSize } = require('./openai.util');
const fs = require('fs');

const textCompletion = async(model, messages, stream = false) => {
    console.log(messages);
    const response =  await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
    });

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


const combinedStream = async function*(textStream, templateId) {
    let fullResponse = '';
    let audioBuffer = Buffer.alloc(0);
    let isLastChunk = false;
    let pendingTextStream = [];

    for await (const part of textStream) {
        const content = part.choices[0]?.delta?.content || '';
        fullResponse += content;
        pendingTextStream.push(content);
    }

    const audioStream = await textToSpeech(fullResponse, templateId.voice);
    const audioIterator = audioStream[Symbol.asyncIterator]();
    let isTextStreamed = false;

    while (!isLastChunk) {
        const { value, done } = await audioIterator.next();
        isLastChunk = done;

        if (value) {
            audioBuffer = Buffer.concat([audioBuffer, value]);
        }


        if(audioBuffer.length >= audioStreamChunkSize && !isTextStreamed) {
            isTextStreamed = true;
            for (const textChunk of pendingTextStream) {
                yield {
                    messageStreamed: { role: 'system', content: textChunk },
                    templateId,
                };
            }
        }

        while (audioBuffer.length >= audioStreamChunkSize || (isLastChunk && audioBuffer.length > 0)) {
            const chunkToSend = audioBuffer.slice(0, audioStreamChunkSize);
            audioBuffer = audioBuffer.slice(audioStreamChunkSize);

            yield {
                audioStreamed: { content: chunkToSend.toString('base64') },
                templateId
            };

            if (isLastChunk && audioBuffer.length === 0) {
                break;
            }
        }
    }
}

module.exports = { textCompletion, transcribeAudio, textToSpeech, combinedStream };