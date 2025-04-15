// server/microservices/business-service/business-service.js

import dotenv from 'dotenv';
// .env 파일 경로 명시 (auth-service 스타일 적용)
dotenv.config({ path: './.env' });

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { parse } from 'graphql'; 

import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

import { config } from './config/config.js';
import connectDB from './config/mongoose.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3003','http://localhost:3004', 'http://localhost:3005', 'http://localhost:4000', 'https://studio.apollographql.com'],
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let schema;
try {
    const parsedTypeDefs = (typeof typeDefs === 'string') ? parse(typeDefs) : typeDefs;
    schema = buildSubgraphSchema([{ typeDefs: parsedTypeDefs, resolvers }]);
} catch (err) {
    console.error("Error parsing typeDefs or building schema:", err);
    const minimalTypeDefs = gql`type Query { _placeholder: String }`;
    schema = buildSubgraphSchema([{ typeDefs: minimalTypeDefs, resolvers: { Query: { _placeholder: () => null } } }]);
}


const server = new ApolloServer({
  schema,
  introspection: true,
});

async function startServer() {
  await server.start();

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      let user = null;
      if (token && config.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          user = { id: decoded.id, username: decoded.username }; 
        } catch (err) {
            console.error("JWT verification failed in context:", err.message);
        }
      }
      return { user, req, res };
    }
  }));

  app.listen(config.port, () => {
    console.log(`Business Service running at http://localhost:${config.port}/graphql`);
  });
}

startServer();