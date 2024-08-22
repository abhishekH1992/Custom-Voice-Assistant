const { PubSub } = require('graphql-subscriptions');
const { getTemplateInfo, completion } = require('../utils/template.utils');

const pubsub = new PubSub();
const CHATGPT_RESPONSE = 'CHATGPT_RESPONSE';

const conversationResolver = {
    Mutation: {
        askAI: async(_, { templateId, newMessage, history }) => {
            // try {
                const template = await getTemplateInfo(templateId);
                const messages = [
                    { role: 'system', content: template.prompt },
                    ...history,
                    { role: 'user', content: newMessage }
                ];

                const response = await completion(template.model, messages, true);
                // console.log(response);
                (async () => {
                    for await (const chunk of response) {
                        console.log('chunk'+chunk);
                        const content = chunk.choices[0]?.delta?.content || '';
                        pubsub.publish(CHATGPT_RESPONSE, { streamingResponse: content });
                    }
                })();

                return "Streaming started";
            // } catch (error) {
            //     console.error('Error completion:', error);
            //     throw new Error('Failed to fetch completion');
            // }
        }
    },
    Subscription: {
        streamingResponse: {
            subscribe: () => pubsub.asyncIterator([CHATGPT_RESPONSE]),
        },
    },
};

module.exports = conversationResolver;