import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import dotenv from 'dotenv';
import cors from 'cors';

import resolvers from './graphql/resolvers.js';
import typeDefs from './graphql/typeDefs.js';
import connectDB from './config/mongoose.js'; 

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], 
  credentials: true,
}));
app.use(express.json());

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

async function startServer() {
  await connectDB();

  await server.start();

  app.use('/graphql', cors(), express.json(), expressMiddleware(server));

  const port = process.env.BUSINESS_PORT || 4003;
  app.listen(port, () => {
    console.log(`Business Subgraph ready at http://localhost:${port}/graphql`);
  });
}

startServer();