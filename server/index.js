// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const OpenAI = require('openai');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 4000;

const openai = new OpenAI({
  apiKey: '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'
});

const systemMessage = {
  role: "system",
  content:
    "You are an Askbot. You are supposed to answer the questions asked by the users. Validate the prompts to be a question and it should not be inappropriate. Give funky responses",
};

const getStreamingCompletion = async ({ userPrompt }) => {
  return openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: userPrompt }],
    stream: true,
  });
};

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.post("/aiCompletion", async (req, res) => {
  const data = req.body;
  try {
    const stream = await getStreamingCompletion({ userPrompt: data?.userPrompt });
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    });
    let poem = '';
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content || "";
      poem = poem + content;
      if (content) {
        res.write(content);
      }
    }
    console.log(poem);
    res.end();
  } catch (error) {
    console.error('Error in AI completion:', error);
    res.status(500).json({ error: 'An error occurred during AI completion' });
  }
});

// GraphQL Schema
const typeDefs = `
  type Query {
    ping: String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    ping: () => 'pong'
  }
};

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 AI Completion endpoint ready at http://localhost:${PORT}/aiCompletion`);
}

startApolloServer();