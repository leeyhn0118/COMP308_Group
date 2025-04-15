const typeDefs = `#graphql
  type Post {
    id: ID!
    title: String!
    content: String!
    category: String!
    aiSummary: String
    createdAt: String
    updatedAt: String
    author: ID!
  }

  type HelpRequest {
    id: ID!
    description: String!
    location: String
    isResolved: Boolean
    volunteers: [ID]
    createdAt: String
    updatedAt: String
    author: ID!
  }

  type AIResponse {
    text: String!
    summary: String!
    suggestedQuestions: [String!]!
    retrievedPosts: [Post!]!
    retrievedHelps: [HelpRequest!]
  }

  type Query {
    posts: [Post]
    helpRequests: [HelpRequest]
    communityAIQuery(input: String!): AIResponse!
  }

  type Mutation {
    createPost(title: String!, content: String!, category: String!): Post
    updatePost(id: ID!, title: String, content: String, category: String): Post
    deletePost(id: ID!): Boolean

    createHelpRequest(description: String!, location: String): HelpRequest
    updateHelpRequest(id: ID!, description: String, location: String, isResolved: Boolean, volunteers: [ID]): HelpRequest
    deleteHelpRequest(id: ID!): Boolean
  }
`;

export default typeDefs;
