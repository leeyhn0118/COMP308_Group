import gql from 'graphql-tag';

const typeDefs = gql`

  type User @key(fields: "id") {
    id: ID! 
    username: String!
    email: String!
    role: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    currentUser: User
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    register(username: String!, email: String!, password: String!, role: String!): AuthPayload
    logout: Boolean
  }
`;

export default typeDefs;