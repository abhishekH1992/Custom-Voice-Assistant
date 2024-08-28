const { Template } = require('../models');
const { PubSub } = require('graphql-subscriptions');
const { textCompletion } = require('../utils/conversation.util');

const pubsub = new PubSub();

const conversationResolver = {
      Mutation: {
        sendMessage: async (_, { templateId, message }) => {
            try {
                const template = await Template.findByPk(templateId);

                const stream = await textCompletion(
                    template.model,
                    [
                        { 'role': 'system', content: template.prompt },
                        ...message
                    ],
                    true
                );
                for await (const part of stream) {
                    const content = part.choices[0]?.delta?.content || '';
                    pubsub.publish('MESSAGE_STREAMED', { messageStreamed: content, templateId });
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
      },
};

module.exports = conversationResolver;