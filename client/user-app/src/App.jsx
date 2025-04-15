import React from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import UserComponent from './UserComponent';

const client = new ApolloClient({
  uri: 'http://localhost:4004/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

function App() {
  return (
    <ApolloProvider client={client}>
      <UserComponent />
    </ApolloProvider>
  );
}

export default App;
