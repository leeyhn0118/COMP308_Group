import dotenv from 'dotenv';
dotenv.config();

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
  origin: ['http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:4000', 'https://studio.apollographql.com'],
  credentials: true,
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const schema = buildSubgraphSchema([{ typeDefs: parse(typeDefs), resolvers }]);

const server = new ApolloServer({ schema, introspection: true });

async function startServer() {
  await server.start();
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
      let user = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          user = { username: decoded.username, _id: decoded._id };
        } catch (e) {
          console.error('[Invalid token]', e.message);
        }
      }
    
      return { user, res };
    }
    
  }));

  app.listen(config.port, () => {
    console.log(`Community Microservice running at http://localhost:${config.port}/graphql`);
  });
}

startServer();
