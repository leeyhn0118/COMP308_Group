import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway'; 
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express'; 
import http from 'http';
import cors from 'cors';

const app = express();

const httpServer = http.createServer(app);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], 
  credentials: true,
}));

app.use(express.json()); 

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth-service', url: 'http://localhost:4001/graphql' },
      { name: 'community-service', url: 'http://localhost:4002/graphql' },
      { name: 'business-service', url: 'http://localhost:4003/graphql' },
      { name: 'ai-service', url: 'http://localhost:4004/graphql' },
    ],
    pollIntervalInMs: 60000, 
  }),
  introspection: true,
});

const server = new ApolloServer({
  gateway,
});

async function startServer() {
  await server.start();
  app.use('/graphql', expressMiddleware(server));

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log('Apollo Gateway running at http://localhost:4000/graphql');
}

startServer();
