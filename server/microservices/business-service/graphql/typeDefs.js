import gql from 'graphql-tag';

const typeDefs = gql`
  type Business @key(fields: "id") {
    id: ID!
    name: String!
    description: String!
    address: Address
    contact: Contact
    category: String!
    owner: User 
    operatingHours: String
    createdAt: String 
    updatedAt: String 
    deals: [Deal] 
  }

  type Event @key(fields: "id") {
    id: ID!
    title: String!
    description: String!
    date: String! 
    startTime: String
    endTime: String
    location: Location
    organizer: User 
    category: String
    requiredVolunteers: [RequiredVolunteer]
    attendees: [User] 
    tags: [String]
    createdAt: String
    updatedAt: String
  }

  type Deal @key(fields: "id") {
    id: ID!
    business: Business! 
    title: String!
    description: String!
    startDate: String 
    endDate: String 
    promoCode: String
    terms: String
    createdAt: String
    updatedAt: String
  }

  type Feedback @key(fields: "id") {
    id: ID!
    targetType: String! 
    targetId: ID! 
    # target: BusinessOrEvent 
    user: User! 
    rating: Int
    comment: String!
    sentiment: String 
    sentimentScore: Float
    createdAt: String
    updatedAt: String
  }

  extend type User @key(fields: "id") {
    id: ID! @external 
  }

  type Address {
    street: String
    city: String
    province: String
    postalCode: String
  }

  type Contact {
    phone: String
    email: String
    website: String
  }

  type Location {
    name: String
    address: String
  }

  type RequiredVolunteer {
    role: String!
    count: Int!
  }

  input AddressInput {
    street: String
    city: String
    province: String
    postalCode: String
  }

  input ContactInput {
    phone: String
    email: String
    website: String
  }

  input LocationInput {
    name: String
    address: String
  }

  input RequiredVolunteerInput {
    role: String!
    count: Int!
  }

  input CreateBusinessInput {
    name: String!
    description: String!
    address: AddressInput
    contact: ContactInput
    category: String!
    ownerId: ID 
    operatingHours: String
  }

  input UpdateBusinessInput {
    name: String
    description: String
    address: AddressInput
    contact: ContactInput
    category: String
    ownerId: ID
    operatingHours: String
  }

  input CreateEventInput {
    title: String!
    description: String!
    date: String! 
    startTime: String
    endTime: String
    location: LocationInput
    organizerId: ID # User ID
    category: String
    requiredVolunteers: [RequiredVolunteerInput]
    tags: [String]
  }

   input UpdateEventInput {
    title: String
    description: String
    date: String
    startTime: String
    endTime: String
    location: LocationInput
    organizerId: ID
    category: String
    requiredVolunteers: [RequiredVolunteerInput]
    tags: [String]
  }

  input CreateDealInput {
    businessId: ID! 
    title: String!
    description: String!
    startDate: String 
    endDate: String 
    promoCode: String
    terms: String
  }

  input UpdateDealInput {
    title: String
    description: String
    startDate: String
    endDate: String
    promoCode: String
    terms: String
  }

  input CreateFeedbackInput {
    targetType: String! 
    targetId: ID!
    userId: ID! 
    rating: Int
    comment: String!
  }

  input UpdateFeedbackInput {
    rating: Int 
    comment: String 
  }

  type Query {
    getAllBusinesses: [Business]
    getBusinessById(id: ID!): Business
    getAllEvents: [Event]
    getEventById(id: ID!): Event
    getDealsByBusiness(businessId: ID!): [Deal]
    getAllDeals: [Deal] 
    getFeedbackByTarget(targetType: String!, targetId: ID!): [Feedback]
  }

  type Mutation {
    createBusiness(input: CreateBusinessInput!): Business
    updateBusiness(id: ID!, input: UpdateBusinessInput!): Business
    deleteBusiness(id: ID!): Boolean 

    createEvent(input: CreateEventInput!): Event
    updateEvent(id: ID!, input: UpdateEventInput!): Event
    deleteEvent(id: ID!): Boolean

    createDeal(input: CreateDealInput!): Deal
    updateDeal(id: ID!, input: UpdateDealInput!): Deal
    deleteDeal(id: ID!): Boolean

    createFeedback(input: CreateFeedbackInput!): Feedback
    updateFeedback(id: ID!, input: UpdateFeedbackInput!): Feedback
    deleteFeedback(id: ID!): Boolean
  }
`;

export default typeDefs;