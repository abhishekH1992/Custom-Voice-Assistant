const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, transcribeAudio, textToSpeech } = require('../utils/conversation.util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const pubsub = new PubSub();
let audioChunks = [];

async function* combinedStream(textStream, audioPromise, templateId) {
    const audioStream = await audioPromise;
    const audioIterator = audioStream[Symbol.asyncIterator]();
    let audioChunk = await audioIterator.next();

    for await (const part of textStream) {
        const content = part.choices[0]?.delta?.content || '';
        yield {
            messageStreamed: { role: 'system', content },
            templateId,
        };

        if (!audioChunk.done) {
            yield {
                audioStreamed: { content: audioChunk.value.toString('base64') },
                templateId
            };
            audioChunk = await audioIterator.next();
        }
    }
    while (!audioChunk.done) {
        yield {
            audioStreamed: { content: audioChunk.value.toString('base64') },
            templateId
        };
        audioChunk = await audioIterator.next();
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
            const filePath = path.join(os.tmpdir(), fileName);
            
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

                const audioStream = await textToSpeech(fullTranscription, template.voice);

                const combinedStreamInstance = (stream, audioStream, templateId);

                for await (const part of combinedStreamInstance) {
                    if (part.messageStreamed) {
                        pubsub.publish('MESSAGE_STREAMED', {
                            messageStreamed: part.messageStreamed,
                            templateId 
                        });
                    } 
                    else if (part.audioStreamed) {
                        pubsub.publish('AUDIO_STREAMED', {
                            audioStreamed: { role: 'system', content: part.audioStreamed },
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