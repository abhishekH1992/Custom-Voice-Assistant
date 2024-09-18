const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion } = require('../utils/conversation.util');
const dotenv = require('dotenv');
const { getRedisCached, addRedisCached } = require('../utils/redis.util');

dotenv.config();
const pubsub = new PubSub();

const conversationResolver = {
    Mutation: {
        sendMessage: async (_, { templateId, messages }) => {
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
                    if(part.choices[0]?.delta?.content !== undefined) {
                        pubsub.publish('MESSAGE_STREAMED', { 
                            messageStreamed: { role: 'system', content: part.choices[0]?.delta?.content || '' },
                            templateId
                        });
                    }
                }
        
                return true;
            } catch (error) {
                console.error('Error sending message to OpenAI:', error);
                return false;
            }
        },
        sendAudioMessage: async (_, { templateId, messages, userTranscribe }) => {
            const cacheKey = `template:${templateId}`;
            try {
                let template = await getRedisCached(cacheKey);
                if(!template) {
                    template = await Template.findByPk(templateId);
                    await addRedisCached(cacheKey, template);
                }

                const transcribe = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: process.env.USER_TRANSCRIBE_PROMPT },
                        { 'role': 'user', content: userTranscribe }
                    ],
                    true
                );

                let fullTranscription = '';
                for await (const part of transcribe) {
                    if(part.choices[0]?.delta?.content !== undefined) {
                        const transcriptionPart = part.choices[0]?.delta?.content || '';
                        fullTranscription += transcriptionPart;
                        pubsub.publish('USER_STREAMED', { 
                            userStreamed: { content: transcriptionPart },
                            templateId
                        });
                    }
                }
                
                let conversationHistory = [
                    { 'role': 'system', content: template.prompt },
                    { 'role': 'user', content: fullTranscription }
                ];
            
                if (messages && messages.length > 0) {
                    conversationHistory = [
                        { 'role': 'system', content: template.prompt },
                        ...messages,
                        { 'role': 'user', content: fullTranscription }
                    ];
                }
                
                const stream = await textCompletion(
                    template.model,
                    conversationHistory,
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
    },
};

module.exports = conversationResolver;