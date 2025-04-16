import { gql } from 'graphql-tag'; 

const typeDefs = gql`
  extend type User @key(fields: "id") {
    id: ID! @external
    username: String @external
    email: String @external
    role: String @external
  }

  type Business @key(fields: "id") {
    id: ID!
    name: String!
    description: String
    address: String
    owner: User! 
    deals: [Deal]
    reviews: [Review]
  }

  type Deal @key(fields: "id") { 
    id: ID!
    title: String
    description: String
    discountPercentage: Int
    startDate: String
    endDate: String
    business: Business! 
  }

  type Review @key(fields: "id") { 
    id: ID!
    business: Business! 
    user: User! 
    rating: Int!
    content: String
    date: String
  }

  type Mutation {
    createBusiness(name: String!, description: String, address: String, ownerId: ID!): Business
    updateBusiness(id: ID!, name: String, description: String, address: String): Business
    deleteBusiness(id: ID!): Boolean

    createDeal(businessId: ID!, title: String!, description: String, discountPercentage: Int!): Deal
    createReview(businessId: ID!, userId: ID!, rating: Int!, content: String): Review
  }

  type Query {
    getBusiness(id: ID!): Business
    getAllBusinesses: [Business]
    getDeal(id: ID!): Deal
    getAllDeals: [Deal]
    getReview(id: ID!): Review
    getAllReviews: [Review]
  }
`;

export default typeDefs;