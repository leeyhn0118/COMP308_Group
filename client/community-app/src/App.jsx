import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import CommunityComponent from './CommunityComponent';
import AIChatBotComponent from './AIChatBotComponent';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <CommunityComponent />
      <AIChatBotComponent />
    </ApolloProvider>
  );
}
