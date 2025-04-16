import { gql } from 'apollo-server-express';

const typeDefs = gql`
  extend type Business @key(fields: "id") {
    id: ID! @external 
    name: String @external 
    category: String @external 
  }

  type SentimentResult {
    positive: Float
    neutral: Float
    negative: Float
  }

  type Recommendation {
    id: ID!
    title: String!
    description: String
    business: Business! 
    confidence: Float
  }

  type TrendReport {
    trends: [String]
    insights: [String]
  }

  type Query {
    analyzeSentiment(content: String!): SentimentResult
    getRecommendations(location: String!): [Recommendation]
  }

  type Mutation {
    generateTrendReport(category: String!): TrendReport
  }
`;

export default typeDefs;
