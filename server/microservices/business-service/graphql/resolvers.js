// server/microservices/business-service/graphql/resolvers.js
import mongoose from 'mongoose';
import Business from '../models/Business.js';
import Event from '../models/Event.js';
import Deal from '../models/Deal.js';
import Feedback from '../models/Feedback.js';
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    getAllBusinesses: async () => {
      try {
        return await Business.find();
      } catch (error) {
        console.error("Error fetching businesses:", error);
        throw new GraphQLError('Failed to fetch businesses', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getBusinessById: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Business ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      try {
        const business = await Business.findById(id);
        if (!business) {
          throw new GraphQLError('Business not found', { extensions: { code: 'NOT_FOUND' } });
        }
        return business;
      } catch (error) {
        console.error("Error fetching business by ID:", error);
        throw new GraphQLError('Failed to fetch business', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getAllEvents: async () => {
      try {
        return await Event.find();
      } catch (error) {
        console.error("Error fetching events:", error);
        throw new GraphQLError('Failed to fetch events', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getEventById: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Event ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      try {
        const event = await Event.findById(id);
        if (!event) {
          throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
        }
        return event;
      } catch (error) {
        console.error("Error fetching event by ID:", error);
        throw new GraphQLError('Failed to fetch event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getDealsByBusiness: async (_, { businessId }) => {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        throw new GraphQLError('Invalid Business ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      try {
        return await Deal.find({ business: businessId });
      } catch (error) {
        console.error("Error fetching deals by business:", error);
        throw new GraphQLError('Failed to fetch deals', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getAllDeals: async () => {
      try {
        return await Deal.find();
      } catch (error) {
        console.error("Error fetching all deals:", error);
        throw new GraphQLError('Failed to fetch deals', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getFeedbackByTarget: async (_, { targetType, targetId }) => {
      if (!['Business', 'Event'].includes(targetType)) {
        throw new GraphQLError('Invalid target type', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new GraphQLError('Invalid target ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      try {
        return await Feedback.find({ targetType, targetId });
      } catch (error) {
        console.error("Error fetching feedback by target:", error);
        throw new GraphQLError('Failed to fetch feedback', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
  },

  Mutation: {
    createBusiness: async (_, { input }) => {
      try {
        const newBusiness = new Business(input);
        await newBusiness.save();
        return newBusiness;
      } catch (error) {
        console.error("Error creating business:", error);
        if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw new GraphQLError('Failed to create business', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    updateBusiness: async (_, { id, input }, context) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Business ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // TODO: Authorization logic needed using context.user
      try {
        const updatedBusiness = await Business.findByIdAndUpdate(id, input, { new: true, runValidators: true });
        if (!updatedBusiness) {
          throw new GraphQLError('Business not found', { extensions: { code: 'NOT_FOUND' } });
        }
        return updatedBusiness;
      } catch (error) {
        console.error("Error updating business:", error);
        if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw new GraphQLError('Failed to update business', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    deleteBusiness: async (_, { id }, context) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Business ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // TODO: Authorization logic needed using context.user
      try {
        const deletedBusiness = await Business.findByIdAndDelete(id);
        if (!deletedBusiness) {
          throw new GraphQLError('Business not found', { extensions: { code: 'NOT_FOUND' } });
        }
        // TODO: Cleanup related Deals, Feedback?
        return true;
      } catch (error) {
        console.error("Error deleting business:", error);
        throw new GraphQLError('Failed to delete business', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },

    createEvent: async (_, { input }) => {
       try {
        const newEvent = new Event(input);
        await newEvent.save();
        return newEvent;
      } catch (error) {
        console.error("Error creating event:", error);
         if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw new GraphQLError('Failed to create event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    updateEvent: async (_, { id, input }, context) => {
       if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Event ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // TODO: Authorization logic needed using context.user
      try {
        const updatedEvent = await Event.findByIdAndUpdate(id, input, { new: true, runValidators: true });
         if (!updatedEvent) {
          throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
        }
        return updatedEvent;
      } catch (error) {
        console.error("Error updating event:", error);
        if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw new GraphQLError('Failed to update event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    deleteEvent: async (_, { id }, context) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Event ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // TODO: Authorization logic needed using context.user
      try {
        const deletedEvent = await Event.findByIdAndDelete(id);
         if (!deletedEvent) {
          throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
        }
        // TODO: Cleanup related Feedback?
        return true;
      } catch (error) {
        console.error("Error deleting event:", error);
        throw new GraphQLError('Failed to delete event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },

    createDeal: async (_, { input }) => {
       if (!mongoose.Types.ObjectId.isValid(input.businessId)) {
        throw new GraphQLError('Invalid Business ID format for deal', { extensions: { code: 'BAD_USER_INPUT' } });
      }
       try {
         const businessExists = await Business.findById(input.businessId);
         if (!businessExists) {
            throw new GraphQLError('Business not found for the deal', { extensions: { code: 'NOT_FOUND' } });
         }
         const newDeal = new Deal({ ...input, business: input.businessId });
         await newDeal.save();
         return newDeal;
       } catch (error) {
         console.error("Error creating deal:", error);
          if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
         }
         throw new GraphQLError('Failed to create deal', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
    },
    updateDeal: async (_, { id, input }, context) => {
       if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Deal ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
       // TODO: Authorization logic needed using context.user
       try {
         const updatedDeal = await Deal.findByIdAndUpdate(id, input, { new: true, runValidators: true });
          if (!updatedDeal) {
           throw new GraphQLError('Deal not found', { extensions: { code: 'NOT_FOUND' } });
         }
         return updatedDeal;
       } catch (error) {
         console.error("Error updating deal:", error);
          if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
         }
         throw new GraphQLError('Failed to update deal', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
    },
    deleteDeal: async (_, { id }, context) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Deal ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // TODO: Authorization logic needed using context.user
      try {
        const deletedDeal = await Deal.findByIdAndDelete(id);
         if (!deletedDeal) {
          throw new GraphQLError('Deal not found', { extensions: { code: 'NOT_FOUND' } });
        }
        return true;
      } catch (error) {
        console.error("Error deleting deal:", error);
        throw new GraphQLError('Failed to delete deal', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },

    createFeedback: async (_, { input }, context) => {
      const userId = context.user?.id;
      if (!userId) {
        throw new GraphQLError('User not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
       if (!mongoose.Types.ObjectId.isValid(input.targetId)) {
        throw new GraphQLError('Invalid target ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
       if (!mongoose.Types.ObjectId.isValid(input.userId)) {
        throw new GraphQLError('Invalid user ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
       if(userId !== input.userId) {
           throw new GraphQLError('User ID mismatch', { extensions: { code: 'BAD_USER_INPUT' } });
       }
       // TODO: Call AI service for sentiment analysis?
       try {
         const newFeedback = new Feedback(input);
         await newFeedback.save();
         return newFeedback;
       } catch (error) {
         console.error("Error creating feedback:", error);
         if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
         }
         throw new GraphQLError('Failed to create feedback', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
    },
    updateFeedback: async (_, { id, input }, context) => {
       const userId = context.user?.id;
       if (!userId) {
         throw new GraphQLError('User not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
       }
       if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new GraphQLError('Invalid Feedback ID format', { extensions: { code: 'BAD_USER_INPUT' } });
       }

       try {
         const feedback = await Feedback.findById(id);
         if (!feedback) {
           throw new GraphQLError('Feedback not found', { extensions: { code: 'NOT_FOUND' } });
         }
         if (feedback.userId.toString() !== userId) {
           throw new GraphQLError('Not authorized to update this feedback', { extensions: { code: 'FORBIDDEN' } });
         }
         // TODO: Re-analyze sentiment if comment changed?
         const updatedFeedback = await Feedback.findByIdAndUpdate(id, input, { new: true, runValidators: true });
         return updatedFeedback;
       } catch (error) {
         console.error("Error updating feedback:", error);
          if (error.name === 'ValidationError') {
           throw new GraphQLError(`Validation failed: ${error.message}`, { extensions: { code: 'BAD_USER_INPUT' } });
         }
         if (error.extensions?.code === 'FORBIDDEN' || error.extensions?.code === 'NOT_FOUND') throw error;
         throw new GraphQLError('Failed to update feedback', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
    },
    deleteFeedback: async (_, { id }, context) => {
      const userId = context.user?.id;
       if (!userId) {
         throw new GraphQLError('User not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
       }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError('Invalid Feedback ID format', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      try {
         const feedback = await Feedback.findById(id);
         if (!feedback) {
           throw new GraphQLError('Feedback not found', { extensions: { code: 'NOT_FOUND' } });
         }
         if (feedback.userId.toString() !== userId) {
           throw new GraphQLError('Not authorized to delete this feedback', { extensions: { code: 'FORBIDDEN' } });
         }
        await Feedback.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error("Error deleting feedback:", error);
        if (error.extensions?.code === 'FORBIDDEN' || error.extensions?.code === 'NOT_FOUND') throw error;
        throw new GraphQLError('Failed to delete feedback', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
  },

  Business: {
    deals: async (parent) => {
      try {
        return await Deal.find({ business: parent.id });
      } catch (error) {
         console.error("Error fetching deals for business:", error);
         return [];
      }
    },
    owner: (parent) => {
      return parent.ownerId ? { __typename: 'User', id: parent.ownerId } : null;
    },
    createdAt: (parent) => parent.createdAt?.toISOString() || null,
    updatedAt: (parent) => parent.updatedAt?.toISOString() || null,
  },

  Event: {
     organizer: (parent) => {
        return parent.organizer ? { __typename: 'User', id: parent.organizer } : null;
     },
     attendees: (parent) => {
        return parent.attendees?.map(userId => ({ __typename: 'User', id: userId })) || [];
     },
     date: (parent) => parent.date?.toISOString() || null,
     createdAt: (parent) => parent.createdAt?.toISOString() || null,
     updatedAt: (parent) => parent.updatedAt?.toISOString() || null,
  },

  Deal: {
     business: async (parent) => {
        try {
           return await Business.findById(parent.business);
        } catch (error) {
           console.error("Error fetching business for deal:", error);
           return null;
        }
     },
     startDate: (parent) => parent.startDate?.toISOString() || null,
     endDate: (parent) => parent.endDate?.toISOString() || null,
     createdAt: (parent) => parent.createdAt?.toISOString() || null,
     updatedAt: (parent) => parent.updatedAt?.toISOString() || null,
  },

  Feedback: {
      user: (parent) => {
          return parent.userId ? { __typename: 'User', id: parent.userId } : null;
      },
      createdAt: (parent) => parent.createdAt?.toISOString() || null,
      updatedAt: (parent) => parent.updatedAt?.toISOString() || null,
  },

  Business: {
    __resolveReference: async (reference) => {
      if (!mongoose.Types.ObjectId.isValid(reference.id)) return null;
      try { return await Business.findById(reference.id); } catch (error) { console.error("Error resolving Business reference:", error); return null; }
    }
  },
  Event: {
     __resolveReference: async (reference) => {
       if (!mongoose.Types.ObjectId.isValid(reference.id)) return null;
       try { return await Event.findById(reference.id); } catch (error) { console.error("Error resolving Event reference:", error); return null; }
     }
  },
   Deal: {
     __resolveReference: async (reference) => {
       if (!mongoose.Types.ObjectId.isValid(reference.id)) return null;
       try { return await Deal.findById(reference.id); } catch (error) { console.error("Error resolving Deal reference:", error); return null; }
     }
   },
   Feedback: {
     __resolveReference: async (reference) => {
      if (!mongoose.Types.ObjectId.isValid(reference.id)) return null;
      try { return await Feedback.findById(reference.id); } catch (error) { console.error("Error resolving Feedback reference:", error); return null; }
     }
   }
};

export default resolvers;