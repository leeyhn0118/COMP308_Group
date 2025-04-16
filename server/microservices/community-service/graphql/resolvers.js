import Post from '../models/Post.js';
import HelpRequest from '../models/HelpRequest.js';
import NewsItem from '../models/NewsItem.js';
import { callAiService } from '../util/callAiService.js';
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    posts: async () => {
      return await Post.find().sort({ createdAt: -1 });
    },
    getPostById: async (_, { id }) => {
      return await Post.findById(id);
    },

    helpRequests: async () => {
      return await HelpRequest.find().sort({ createdAt: -1 });
    },
    getHelpRequestById: async (_, { id }) => {
      return await HelpRequest.findById(id);
    },

    getAllNews: async () => {
      return await NewsItem.find().sort({ publicationDate: -1, createdAt: -1 });
    },
    getNewsById: async (_, { id }) => {
      return await NewsItem.findById(id);
    },
    getAllEvents: async () => {
      try {
        return await Event.find().sort({ createdAt: -1 });
      } catch (err) {
        console.error("Error fetching events", err);
        throw new GraphQLError('Failed to fetch events', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    getEventById: async (_, { id }) => {
      try {
        const event = await Event.findById(id);
        if (!event) {
          throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
        }
        return event;
      } catch (err) {
        console.error("Error fetching event by ID", err);
        throw new GraphQLError('Failed to fetch event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
  },

  Mutation: {
    createPost: async (_, { title, content, category, authorId }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in first', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      if (user.role !== 'Resident') {
        throw new GraphQLError('Only Residents can create posts', { extensions: { code: 'FORBIDDEN' } });
      }

      const post = new Post({ title, content, category, author: authorId });
      await post.save();
      return post;
    },

    updatePost: async (_, { id, title, content, category }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in first', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new GraphQLError('Post not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (post.author.toString() !== user.id) {
        throw new GraphQLError('You are not authorized to update this post', { extensions: { code: 'FORBIDDEN' } });
      }

      post.title = title || post.title;
      post.content = content || post.content;
      post.category = category || post.category;
      await post.save();

      return post;
    },

    deletePost: async (_, { id }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in first', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new GraphQLError('Post not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (post.author.toString() !== user.id) {
        throw new GraphQLError('You are not authorized to delete this post', { extensions: { code: 'FORBIDDEN' } });
      }

      await post.remove();
      return true;
    },

    createHelpRequest: async (_, { description, location, requiredSkills, authorId }) => {
      const helpRequest = new HelpRequest({
        description,
        location,
        requiredSkills,
        author: authorId,
      });
      await helpRequest.save();
      return helpRequest;
    },
    updateHelpRequest: async (_, { id, description, location, isResolved, volunteerIds }) => {
      const helpRequest = await HelpRequest.findById(id);
      if (!helpRequest) {
        throw new GraphQLError('HelpRequest not found', { extensions: { code: 'NOT_FOUND' } });
      }

      helpRequest.description = description || helpRequest.description;
      helpRequest.location = location || helpRequest.location;
      helpRequest.isResolved = isResolved || helpRequest.isResolved;
      helpRequest.volunteers = volunteerIds || helpRequest.volunteers;
      await helpRequest.save();

      return helpRequest;
    },
    deleteHelpRequest: async (_, { id }) => {
      const helpRequest = await HelpRequest.findById(id);
      if (!helpRequest) {
        throw new GraphQLError('HelpRequest not found', { extensions: { code: 'NOT_FOUND' } });
      }
      await helpRequest.remove();
      return true;
    },

    createNews: async (_, { title, content, source, publicationDate, category, authorId }) => {
      const newsItem = new NewsItem({ title, content, source, publicationDate, category, author: authorId });
      await newsItem.save();
      return newsItem;
    },
    updateNews: async (_, { id, title, content, source, publicationDate, category }) => {
      const newsItem = await NewsItem.findById(id);
      if (!newsItem) {
        throw new GraphQLError('NewsItem not found', { extensions: { code: 'NOT_FOUND' } });
      }

      newsItem.title = title || newsItem.title;
      newsItem.content = content || newsItem.content;
      newsItem.source = source || newsItem.source;
      newsItem.publicationDate = publicationDate || newsItem.publicationDate;
      newsItem.category = category || newsItem.category;
      await newsItem.save();

      return newsItem;
    },
    deleteNews: async (_, { id }) => {
      const newsItem = await NewsItem.findById(id);
      if (!newsItem) {
        throw new GraphQLError('NewsItem not found', { extensions: { code: 'NOT_FOUND' } });
      }
      await newsItem.remove();
      return true;
    },
    createEvent: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in first', { extensions: { code: 'UNAUTHENTICATED' } });
      }
    
      if (user.role !== 'Community Organizer') {
        throw new GraphQLError('Only Community Organizers can create events', { extensions: { code: 'FORBIDDEN' } });
      }
    
      const newEvent = new Event({ ...input, organizer: user.id });
      await newEvent.save();
      return newEvent;
    },
    
    updateEvent: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in first', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const event = await Event.findById(id);
      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (event.organizer.toString() !== user.id) {
        throw new GraphQLError('You are not authorized to update this event', { extensions: { code: 'FORBIDDEN' } });
      }

      try {
        Object.assign(event, input);
        await event.save();
        return event;
      } catch (err) {
        console.error("Error updating event", err);
        throw new GraphQLError('Failed to update event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    deleteEvent: async (_, { id }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to delete an event', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const event = await Event.findById(id);
      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }

      if (event.organizer.toString() !== user.id) {
        throw new GraphQLError('You are not authorized to delete this event', { extensions: { code: 'FORBIDDEN' } });
      }

      try {
        await event.remove();
        return true;
      } catch (err) {
        console.error("Error deleting event", err);
        throw new GraphQLError('Failed to delete event', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    matchVolunteersToHelpRequest: async (_, { helpRequestId }) => {
      const helpRequest = await HelpRequest.findById(helpRequestId);
      if (!helpRequest) {
        throw new GraphQLError('HelpRequest not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const volunteers = await User.find({}); 
      const aiMatchQuery = `
        mutation MatchVolunteers($description: String!, $requiredSkills: [String], $volunteers: [VolunteerProfileInput!]!) {
          matchVolunteers(description: $description, requiredSkills: $requiredSkills, volunteers: $volunteers) {
            matchedVolunteers {
              id
              skills
            }
          }
        }
      `;

      const variables = {
        description: helpRequest.description,
        requiredSkills: helpRequest.requiredSkills || [],
        volunteers: volunteers.map(v => ({
          id: v._id.toString(),
          skills: v.skills || [],
        }))
      };

      try {
        const aiResult = await callAiService(aiMatchQuery, variables);
        return aiResult.matchVolunteers.matchedVolunteers;
      } catch (error) {
        console.error("Error matching volunteers", error);
        throw new GraphQLError('Failed to match volunteers', { extensions: { code: 'AI_REQUEST_FAILED' } });
      }
    },
  },

  Post: {
    author: (parent) => {
      return { __typename: 'User', id: parent.author };
    },
  },

  HelpRequest: {
    author: (parent) => {
      return { __typename: 'User', id: parent.author };
    },
    volunteers: (parent) => {
      return parent.volunteers.map((volunteerId) => ({ __typename: 'User', id: volunteerId }));
    },
  },

  NewsItem: {
    author: (parent) => {
      return { __typename: 'User', id: parent.author };
    },
  },
  Event: {
    organizer: (parent) => {
      return { __typename: 'User', id: parent.organizer };
    },
    attendees: (parent) => {
      return parent.attendees.map((userId) => ({ __typename: 'User', id: userId }));
    },
    createdAt: (parent) => parent.createdAt?.toISOString(),
    updatedAt: (parent) => parent.updatedAt?.toISOString(),
  },
};

export default resolvers;
