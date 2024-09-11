const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, transcribeAudio, textToSpeech } = require('../utils/conversation.util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const pubsub = new PubSub();
let audioChunks = [];

const CHUNK_SIZE = 16384; // 16KB

async function* combinedStream(textStream, templateId) {
    let fullResponse = '';
    let audioBuffer = Buffer.alloc(0);
    let isLastChunk = false;

    for await (const part of textStream) { //this stream should start along when it start the audio stream
        const content = part.choices[0]?.delta?.content || '';
        fullResponse += content;

        yield {
            messageStreamed: { role: 'system', content },
            templateId,
        };
    }

    // Generate audio from the full response
    const audioStream = await textToSpeech(fullResponse, templateId.voice);
    const audioIterator = audioStream[Symbol.asyncIterator]();

    while (!isLastChunk) {
        const { value, done } = await audioIterator.next();
        isLastChunk = done;

        if (value) {
            audioBuffer = Buffer.concat([audioBuffer, value]);
        }

        while (audioBuffer.length >= CHUNK_SIZE || (isLastChunk && audioBuffer.length > 0)) {
            const chunkToSend = audioBuffer.slice(0, CHUNK_SIZE);
            audioBuffer = audioBuffer.slice(CHUNK_SIZE);

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

const conversationResolver = {
    Mutation: {
        sendMessage: async (_, { templateId, messages }) => {
            try {
                const template = await Template.findByPk(templateId);
                
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...messages
                    ],
                    true
                );

                for await (const part of stream) {
                    pubsub.publish('MESSAGE_STREAMED', { 
                        messageStreamed: { role: 'system', content: part.choices[0]?.delta?.content || '' },
                        templateId
                    });
                }
        
                return true;
            } catch (error) {
                console.error('Error sending message to OpenAI:', error);
                return false;
            }
        },
        startRecording: () => {
            audioChunks = [];
            console.log('Started recording');
            return true;
        },
        stopRecording: async (_, { templateId, messages }) => {
            const audioBuffer = Buffer.concat(audioChunks);
            const fileName = `audio_${Date.now()}.wav`;
            const filePath = path.join(__dirname, '..', 'temp', fileName);
            
            fs.writeFileSync(filePath, audioBuffer);
        
            try {
                const transcriptionStream = await transcribeAudio(filePath);
                let fullTranscription = '';
                for await (const part of transcriptionStream) {
                    const transcriptionPart = part || '';
                    fullTranscription += transcriptionPart;
                }
                pubsub.publish('USER_STREAMED', { 
                    userStreamed: { content: fullTranscription },
                    templateId
                });

                fs.unlinkSync(filePath);

                const template = await Template.findByPk(templateId);
                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...messages,
                        { 'role': 'user', content: fullTranscription }
                    ],
                    true
                );

                const combinedStreamInstance = combinedStream(stream, templateId);

                for await (const part of combinedStreamInstance) {
                    if (part.messageStreamed) {
                        pubsub.publish('MESSAGE_STREAMED', {
                            messageStreamed: part.messageStreamed,
                            templateId 
                        });
                    } 
                    else if (part.audioStreamed) {
                        pubsub.publish('AUDIO_STREAMED', {
                            audioStreamed: part.audioStreamed,
                            templateId
                        });
                    }
                }
        
                return true;
            } catch (error) {
                console.error('Error transcribing audio or generating response:', error);
                return false;
            }
        },
        sendAudioData: (_, { data }) => {
            const audioData = Buffer.from(data, 'base64');
            audioChunks.push(audioData);
            return true;
        },
    },
    Subscription: {
        messageStreamed: {
            subscribe: (_, { templateId }) => pubsub.asyncIterator(['MESSAGE_STREAMED']),
            resolve: (payload, variables) => {
                if (payload.templateId === variables.templateId) {
                    return payload.messageStreamed;
                }
                return null;
            },
        },
        userStreamed: {
            subscribe: (_, { templateId }) => pubsub.asyncIterator(['USER_STREAMED']),
            resolve: (payload, variables) => {
                if (payload.templateId === variables.templateId) {
                    return payload.userStreamed;
                }
                return null;
            },
        },
        audioStreamed: {
            subscribe: (_, { templateId }) => pubsub.asyncIterator(['AUDIO_STREAMED']),
            resolve: (payload, variables) => {
                if (payload.templateId === variables.templateId) {
                    return payload.audioStreamed;
                }
                return null;
            },
        },
    },
};

module.exports = conversationResolver;