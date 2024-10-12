const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion, transcribeAudio, combinedStream } = require('../utils/conversation.util');
const { getRedisCached, addRedisCached } = require('../utils/redis.util');

const pubsub = new PubSub();

const activeStreams = new Map();

const conversationResolver = {
    Mutation: {
        sendMessage: async(_, { templateId, messages, type }) => {
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
                        messageStreamed: { role: 'system', content: part.choices[0]?.delta?.content || '', type: type  },
                        templateId
                    });
                }
        
                return true;
            } catch (error) {
                console.error('Error sending message to OpenAI:', error);
                return false;
            }
        },
        stopRecording: async (_, { templateId, messages, type }) => {
            if (activeStreams.has(templateId)) {
                activeStreams.get(templateId).abort();
                activeStreams.delete(templateId);
            }
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

                const abortController = new AbortController();
                activeStreams.set(templateId, abortController);

                const combinedStreamInstance = combinedStream(stream, templateId, abortController.signal, type);
                try {
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
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.log(`Stream for template ${templateId} was aborted`);
                    } else {
                        throw error;
                    }
                } finally {
                    activeStreams.delete(templateId);
                }
            
                return true;
            } catch (error) {
                console.error('Error transcribing audio or generating response:', error);
                return false;
            }
        },
        stopStreaming: async (_, { templateId }) => {
            if (activeStreams.has(templateId)) {
                activeStreams.get(templateId).abort();
                activeStreams.delete(templateId);
                return true;
            }
            return false;
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