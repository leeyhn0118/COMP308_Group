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
    createdAt: String
    updatedAt: String
    author: User 
  }

  type HelpRequest @key(fields: "id") {
    id: ID!
    description: String!
    location: String
    isResolved: Boolean
    requiredSkills: [String]
    volunteers: [User] 
    createdAt: String
    updatedAt: String
    author: User 
  }

  type EmergencyAlert @key(fields: "id") {
    id: ID!
    author: User! 
    title: String!
    message: String!
    location: String!
    isResolved: Boolean!
    createdAt: String!
    updatedAt: String
  }

  type NewsItem @key(fields: "id") {
    id: ID!
    title: String!
    content: String!
    source: String
    publicationDate: String
    category: String
    summary: String
    createdAt: String
    updatedAt: String
    author: User 
  }

  type Event @key(fields: "id") {
    id: ID!
    title: String!
    description: String!
    date: String!
    startTime: String
    endTime: String
    location: Location
    organizer: User! 
    category: String!
    requiredVolunteers: [RequiredVolunteer]
    attendees: [User] 
    tags: [String]
    createdAt: String
    updatedAt: String
  }

  type Location {
    name: String
    address: String
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
    getPostById(id: ID!): Post
    helpRequests: [HelpRequest]
    communityAIQuery(input: String!): AIResponse!
    getAllEmergencyAlerts: [EmergencyAlert!]!
    getEmergencyAlert(id: ID!): EmergencyAlert

  }

  type Mutation {
    createPost(title: String!, content: String!, category: String!): Post
    updatePost(id: ID!, title: String, content: String, category: String): Post
    deletePost(id: ID!): Boolean

    createHelpRequest(description: String!, location: String, requiredSkills: [String]): HelpRequest
    updateHelpRequest(id: ID!, description: String, location: String, isResolved: Boolean, volunteerIds: [ID]): HelpRequest
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