import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import cors from 'cors';
import http from 'http';
import gql from 'graphql-tag';

import { config } from './config/config.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';

const app = express();
const httpServer = http.createServer(app);

let schema;
try {
  schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
} catch (err) {
  console.error("Error building subgraph schema in ai-service:", err);
  const minimalTypeDefs = gql`type Query { _placeholderAI: String }`;
  schema = buildSubgraphSchema([{ typeDefs: minimalTypeDefs, resolvers: { Query: { _placeholderAI: () => null } } }]);
}

const server = new ApolloServer({
  schema,
  introspection: true,
});

async function startServer() {
  await server.start();

  app.use(cors()); 
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server)); 

  app.listen(config.port, () => {
    console.log(`AI Service running at http://localhost:${config.port}/graphql`);
  });
}

startServer();