const { Template } = require('../models');
const { getStreamingCompletion } = require('../utils/conversation.util');
const { withFilter } = require('graphql-subscriptions');

const STREAM_CHANNEL = 'AI_RESPONSE_STREAM';

const conversationResolver = {
    Mutation: {
        askAI: async (_, { templateId, newMessage, history }, { pubsub }) => {
            const template = await Template.findByPk(templateId);
            const messages = [
                { role: 'system', content: template.prompt },
                ...history,
                { role: 'user', content: newMessage }
            ];

            const stream = await getStreamingCompletion(template.model, messages, true);
            
            let fullResponse = '';
            for await (const part of stream) {
                const chunk = part.choices[0]?.delta?.content || '';
                fullResponse += chunk;
                pubsub.publish(STREAM_CHANNEL, { 
                    aiResponseStream: { 
                        templateId, 
                        chunk, 
                        done: false 
                    } 
                });
            }

            pubsub.publish(STREAM_CHANNEL, { 
                aiResponseStream: { 
                    templateId, 
                    chunk: '', 
                    done: true 
                } 
            });

            return fullResponse;
        }
    },
    Subscription: {
        aiResponseStream: {
            subscribe: withFilter(
                (_, __, { pubsub }) => pubsub.asyncIterator([STREAM_CHANNEL]),
                (payload, variables) => {
                    return payload.aiResponseStream.templateId === variables.templateId;
                }
            )
        }
    }
};

module.exports = conversationResolver;