import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag'; 

import cors from 'cors';
import cookieParser from 'cookie-parser';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let schema;
try {
  schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
} catch (err) {
  console.error("Error building subgraph schema in auth-service:", err);
  const minimalTypeDefs = gql`type Query { _placeholderAuth: String }`;
  schema = buildSubgraphSchema([{ typeDefs: minimalTypeDefs, resolvers: { Query: { _placeholderAuth: () => null } } }]);
}

const server = new ApolloServer({
  schema,
  introspection: true,
});

async function startServer() {
  await server.start();

  app.get('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });
    res.send({ success: true });
  });

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      let user = null;
      if (token && config.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          user = decoded;
        } catch (err) {
            console.error("JWT verification failed in auth context:", err.message);
        }
      }
      return { user, req, res };
    }
  }));

  app.listen(config.port, () => {
    console.log(`Auth Service running at http://localhost:${config.port}/graphql`);
  });
}

startServer();