import { GraphQLError } from 'graphql';
import { callAiService } from '../util/callAiService.js';

const resolvers = {
  Query: {
    analyzeSentiment: async (_, { content }) => {
      const aiSentimentQuery = `
        query AnalyzeSentiment($content: String!) {
          analyzeSentiment(content: $content) {
            positive
            neutral
            negative
          }
        }
      `;

      try {
        const variables = { content };
        const aiResult = await callAiService(aiSentimentQuery, variables);
        return aiResult.analyzeSentiment;
      } catch (error) {
        console.error("Error analyzing sentiment", error);
        throw new GraphQLError('Failed to analyze sentiment', { extensions: { code: 'AI_REQUEST_FAILED' } });
      }
    },

    getRecommendations: async (_, { location }) => {
      const aiRecommendationQuery = `
        query GetBusinessRecommendations($location: String!) {
          getBusinessRecommendations(location: $location) {
            id
            title
            description
            business {
              name
              category
            }
            confidence
          }
        }
      `;

      try {
        const variables = { location };
        const aiResult = await callAiService(aiRecommendationQuery, variables);
        return aiResult.getBusinessRecommendations;
      } catch (error) {
        console.error("Error fetching recommendations", error);
        throw new GraphQLError('Failed to fetch recommendations', { extensions: { code: 'AI_REQUEST_FAILED' } });
      }
    },
  },

  Mutation: {
    generateTrendReport: async (_, { category }) => {
      const aiTrendQuery = `
        mutation GenerateTrendReport($category: String!) {
          generateTrendReport(category: $category) {
            trends
            insights
          }
        }
      `;

      try {
        const variables = { category };
        const aiResult = await callAiService(aiTrendQuery, variables);
        return aiResult.generateTrendReport;
      } catch (error) {
        console.error("Error generating trend report", error);
        throw new GraphQLError('Failed to generate trend report', { extensions: { code: 'AI_REQUEST_FAILED' } });
      }
    },
  },
};

export default resolvers;
