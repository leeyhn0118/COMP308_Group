import Post from '../models/Post.js';
import HelpRequest from '../models/HelpRequest.js';
import { handleAICommunity } from '../ai/agent.js';
import { saveEmbedding } from '../util/aiHelpers.js';

const resolvers = {
  Query: {
    posts: async (_, __, { user }) => {
      if (!user) throw new Error('You must be logged in');
      return await Post.find({});
    },
    helpRequests: async (_, __, { user }) => {
      if (!user) throw new Error('You must be logged in');
      return await HelpRequest.find({});
    },
    communityAIQuery: async (_, { input }, { user }) => {
      if (!user) throw new Error('Login required for AI features');
      return await handleAICommunity(input, user._id);
    },
  },

  Mutation: {
    createPost: async (_, { title, content, category }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const post = await Post.create({ title, content, category, author: user._id });
      await saveEmbedding(`${title}\n${content}`, 'post', post._id);
      return post;
    },
    updatePost: async (_, { id, title, content, category }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.author.toString() !== user._id.toString()) throw new Error('Not authorized');

      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;
      if (category !== undefined) post.category = category;
      post.updatedAt = new Date();
      await post.save();
      return post;
    },
    deletePost: async (_, { id }, { user }) => {
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.author.toString() !== user._id.toString()) throw new Error('Not authorized');
      await post.deleteOne();
      return true;
    },

    createHelpRequest: async (_, { description, location }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const help = await HelpRequest.create({ description, location, author: user._id });
      await saveEmbedding(description, 'help', help._id);
      return help;
    },
    updateHelpRequest: async (_, args, { user }) => {
      const { id, description, location, isResolved, volunteers } = args;
      const help = await HelpRequest.findById(id);
      if (!help) throw new Error('Help request not found');
      if (help.author.toString() !== user._id.toString()) throw new Error('Not authorized');

      if (description !== undefined) help.description = description;
      if (location !== undefined) help.location = location;
      if (isResolved !== undefined) help.isResolved = isResolved;
      if (volunteers !== undefined) help.volunteers = volunteers;
      help.updatedAt = new Date();
      await help.save();
      return help;
    },
    deleteHelpRequest: async (_, { id }, { user }) => {
      const help = await HelpRequest.findById(id);
      if (!help) throw new Error('Help request not found');
      if (help.author.toString() !== user._id.toString()) throw new Error('Not authorized');
      await help.deleteOne();
      return true;
    },
  },

  Post: {
    createdAt: (p) => p.createdAt?.toISOString(),
    updatedAt: (p) => p.updatedAt?.toISOString(),
  },
  HelpRequest: {
    createdAt: (h) => h.createdAt?.toISOString(),
    updatedAt: (h) => h.updatedAt?.toISOString(),
  },
};

export default resolvers;
