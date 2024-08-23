const { PubSub } = require('graphql-subscriptions');
const OpenAI = require('openai');

const pubsub = new PubSub();
const CHAT_RESPONSE = 'CHAT_RESPONSE';

const openai = new OpenAI({
  apiKey: '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',
});

const resolvers = {
  Subscription: {
    chatResponse: {
      subscribe: (_, { message }) => {
        streamChatResponse(message);
        return pubsub.asyncIterator([CHAT_RESPONSE]);
      },
    },
  },
  Mutation: {
    sendMessage: async (_, { message }) => {
      streamChatResponse(message);
      return true;
    },
  },
};

async function streamChatResponse(message) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
      stream: true,
    });
    let poem = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      poem += content;
      pubsub.publish(CHAT_RESPONSE, { 
        chatResponse: { content, done: false } 
      });
    }
    console.log(poem);
    // Publish a final message to indicate the stream is complete
    pubsub.publish(CHAT_RESPONSE, { 
      chatResponse: { content: '', done: true } 
    });

  } catch (error) {
    console.error('Error:', error);
    pubsub.publish(CHAT_RESPONSE, { 
      chatResponse: { content: 'Error occurred: ' + error.message, done: true } 
    });
  }
}

module.exports = resolvers;