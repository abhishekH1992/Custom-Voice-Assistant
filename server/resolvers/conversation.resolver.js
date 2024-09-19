const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, transcribeAudio, combinedStream } = require('../utils/conversation.util');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const pubsub = new PubSub();
let audioChunks = [];

const conversationResolver = {
    Mutation: {
        sendMessage: async(_, { templateId, messages }) => {
            const cacheKey = `template:${templateId}`;
            try {
                let template = await getRedisCached(cacheKey);
                if(!template) {
                    template = await Template.findByPk(templateId);
                    await addRedisCached(cacheKey, template);
                }
                
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
            const cacheKey = `template:${templateId}`;
        
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

                let template = await getRedisCached(cacheKey);
                if(!template) {
                    template = await Template.findByPk(templateId);
                    await addRedisCached(cacheKey, template);
                }
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