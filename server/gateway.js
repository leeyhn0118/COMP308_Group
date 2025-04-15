import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource  } from '@apollo/gateway';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true,
}));
app.use(cookieParser());

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: `http://localhost:${process.env.AUTH_PORT || 4001}/graphql` }, 
      { name: 'community', url: `http://localhost:${process.env.COMMUNITY_PORT || 4002}/graphql` }, 
      { name: 'business', url: `http://localhost:${process.env.BUSINESS_PORT || 4003}/graphql` }, 
      //{ name: 'ai', url: `http://localhost:${process.env.AI_PORT || 4004}/graphql` }, 
    ],
  }),
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context.token) {
          request.http.headers.set('authorization', `Bearer ${context.token}`);
        }
      },
    });
  }
});

const server = new ApolloServer({
  gateway,
  introspection: true,
});

async function startServer() {
  await server.start();
  
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.cookies?.token;
      return { token }; 
    }
  }));
  
  app.listen(4000, () => {
    console.log(`🚀 API Gateway ready at http://localhost:4000/graphql`);
  });
}

startServer();
