import { GraphQLError } from 'graphql';
import Business from '../models/Business.js';
import Deal from '../models/Deal.js';
import Review from '../models/Review.js';
import { callAiService } from '../util/callAiService.js';

const resolvers = {
  Query: {
    getBusiness: async (_, { id }) => {
      return await Business.findById(id).populate('reviews deals');
    },
    getAllBusinesses: async () => {
      return await Business.find().populate('reviews deals');
    },
    getDeal: async (_, { id }) => {
      return await Deal.findById(id);
    },
    getAllDeals: async () => {
      return await Deal.find();
    },
    getReview: async (_, { id }) => {
      return await Review.findById(id);
    },
    getAllReviews: async () => {
      return await Review.find();
    },
  },

  Mutation: {
    createBusiness: async (_, { name, description, address, ownerId }) => {
      const business = new Business({ name, description, address, owner: ownerId });
      await business.save();
      return business;
    },
    updateBusiness: async (_, { id, name, description, address }) => {
      const business = await Business.findById(id);
      if (!business) throw new GraphQLError('Business not found');
      business.name = name || business.name;
      business.description = description || business.description;
      business.address = address || business.address;
      await business.save();
      return business;
    },
    deleteBusiness: async (_, { id }) => {
      const business = await Business.findById(id);
      if (!business) throw new GraphQLError('Business not found');
      await business.remove();
      return true;
    },

    createDeal: async (_, { businessId, title, description, discountPercentage }) => {
      const deal = new Deal({ business: businessId, title, description, discountPercentage });
      await deal.save();
      return deal;
    },

    createReview: async (_, { businessId, userId, rating, content }) => {
      const review = new Review({ business: businessId, user: userId, rating, content });
      await review.save();
      return review;
    },

    analyzeReviewSentiment: async (_, { reviewText }) => {
      const aiSentimentQuery = `
        mutation AnalyzeSentiment($text: String!) {
          analyzeSentiment(text: $text) {
            sentiment
            score
          }
        }
      `;

      try {
        const variables = { text: reviewText };
        const aiResult = await callAiService(aiSentimentQuery, variables);
        return aiResult.analyzeSentiment;
      } catch (error) {
        console.error("Error analyzing sentiment", error);
        throw new GraphQLError('Failed to analyze sentiment', { extensions: { code: 'AI_REQUEST_FAILED' } });
      }
    },
  },

  Business: {
    owner: (parent) => {
       return { __typename: 'User', id: parent.owner };
    },
    __resolveReference: async (reference) => {
      console.log('Resolving reference for Business ID:', reference.id);
      try {
        const business = await Business.findById(reference.id).populate('reviews deals');
        if (!business) {
           console.warn(`Business not found for reference ID: ${reference.id}`);
           return null;
        }
        return business;
      } catch (error) {
         console.error("Error resolving reference for Business:", error);
         throw new GraphQLError('Could not resolve business reference', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    }
  },

  Deal: {
    business: async (parent) => {
      return { __typename: 'Business', id: parent.business };
    },
  },

  Review: {
    business: (parent) => {
      return { __typename: 'Business', id: parent.business };
    },
    user: (parent) => {
      return { __typename: 'User', id: parent.user };
    }
 }
};

export default resolvers;
