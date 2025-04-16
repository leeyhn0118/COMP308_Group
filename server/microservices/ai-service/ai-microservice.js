import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

import connectDB from './config/mongoose.js';
import { config } from './config/config.js';

import resolvers from './graphql/resolvers.js';
import typeDefs from './graphql/typeDefs.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], 
  credentials: true,
}));

const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

const server = new ApolloServer({
  schema,
  introspection: true,
});

async function startServer() {
  await connectDB();
  await server.start();

  app.use(cors());
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server));

  const PORT = config.port;
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`AI Subgraph running at http://localhost:${PORT}/graphql`);
}

startServer();