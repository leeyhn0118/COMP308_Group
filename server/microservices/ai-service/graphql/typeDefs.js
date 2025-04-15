import gql from 'graphql-tag';

const typeDefs = gql`

  type SummarizationResult {
    summary: String!
  }

  type SentimentResult {
    sentiment: String! 
    score: Float 
  }

  input VolunteerProfileInput {
    id: ID!
    skills: [String]
    availability: String
  }

  type VolunteerProfile {
     id: ID!
     skills: [String]
     availability: String
  }

   type VolunteerMatchResult {
     matchedVolunteers: [VolunteerProfile]!
     matchScore: Float 
   }

  type Query {
    _aiServicePlaceholder: String
  }

  type Mutation {
    summarizeText(text: String!): SummarizationResult
    analyzeSentiment(text: String!): SentimentResult
    matchVolunteers(description: String!, requiredSkills: [String], volunteers: [VolunteerProfileInput!]!): VolunteerMatchResult
  }

`;

export default typeDefs;