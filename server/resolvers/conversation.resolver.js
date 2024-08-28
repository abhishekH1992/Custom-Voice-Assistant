const OpenAI = require("openai");
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const openai = new OpenAI({
  apiKey: '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',
});

const conversationResolver = {
    Query: {
        hello: () => 'Hello world!',
      },
      Mutation: {
        sendMessage: async (_, { templateId, message }) => {
          try {
            const stream = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: message }],
              stream: true,
            });
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