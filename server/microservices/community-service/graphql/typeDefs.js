const typeDefs = `#graphql
type User {
    _id: ID!
    username: String
    email: String
    role: String!
    location: String
    interests: [String]
  }

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

type EmergencyAlert {
    id: ID!
    author: User
    title: String!
    message: String!
    location: String!
    isResolved: Boolean!
    createdAt: String!
    updatedAt: String
  }

type Subscription {
    emergencyAlertCreated: EmergencyAlert!
  }

  type Query {
    posts: [Post]
    helpRequests: [HelpRequest]
    communityAIQuery(input: String!): AIResponse!
  getAllEmergencyAlerts: [EmergencyAlert!]!
    getEmergencyAlert(id: ID!): EmergencyAlert

  }

  type Mutation {
    createPost(title: String!, content: String!, category: String!): Post
    updatePost(id: ID!, title: String, content: String, category: String): Post
    deletePost(id: ID!): Boolean

    createHelpRequest(description: String!, location: String): HelpRequest
    updateHelpRequest(id: ID!, description: String, location: String, isResolved: Boolean, volunteers: [ID]): HelpRequest
    deleteHelpRequest(id: ID!): Boolean
  createEmergencyAlert(title: String!, message: String!, location: String!): EmergencyAlert

    updateEmergencyAlert(
      id: ID!
      title: String
      message: String
      location: String
      isResolved: Boolean
    ): EmergencyAlert!

    deleteEmergencyAlert(id: ID!): Boolean!
  }
`;

export default typeDefs;
