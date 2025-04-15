import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from '../config/config.js';
import { GraphQLError } from 'graphql';

let genAI;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
} else {
  console.warn("GEMINI_API_KEY is not set. AI functionalities will not work.");
}

const safeJsonParse = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error("Failed to parse JSON string:", str, e);
        return null;
    }
};


const resolvers = {
  Query: {
     _aiServicePlaceholder: () => "AI Service is running.",
  },
  Mutation: {
    summarizeText: async (_, { text }) => {
      if (!genAI) {
         throw new GraphQLError("AI Service is not configured.", { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      if (!text || text.trim().length === 0) {
        throw new GraphQLError("Text to summarize cannot be empty.", { extensions: { code: 'BAD_USER_INPUT' } });
      }

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const prompt = `Please summarize the following text concisely:\n\n${text}`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const summary = response.text();
        return { summary };
      } catch (error) {
        console.error("Error during summarization:", error);
        throw new GraphQLError("Failed to summarize text.", { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },

    analyzeSentiment: async (_, { text }) => {
       if (!genAI) {
         throw new GraphQLError("AI Service is not configured.", { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
       if (!text || text.trim().length === 0) {
        throw new GraphQLError("Text to analyze cannot be empty.", { extensions: { code: 'BAD_USER_INPUT' } });
      }

       try {
         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
         const prompt = `Analyze the sentiment of the following text. Respond with only one word: 'positive', 'negative', or 'neutral'. Text: "${text}"`;
         const result = await model.generateContent(prompt);
         const response = result.response;
         let sentiment = response.text().toLowerCase().trim().replace(/['."]/g, ''); 
         if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
             console.warn(`Unexpected sentiment result: ${sentiment}. Attempting cleanup or defaulting.`);
             if (sentiment.includes('positive')) sentiment = 'positive';
             else if (sentiment.includes('negative')) sentiment = 'negative';
             else sentiment = 'neutral';
         }

         return { sentiment, score: null };
       } catch (error) {
         console.error("Error during sentiment analysis:", error);
         throw new GraphQLError("Failed to analyze sentiment.", { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
    },

    matchVolunteers: async (_, { description, requiredSkills, volunteers }) => {
       if (!genAI) {
         throw new GraphQLError("AI Service is not configured.", { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
       if (!volunteers || volunteers.length === 0) {
           return { matchedVolunteers: [] };
       }

       console.log("Attempting LLM-based volunteer matching...");

       const volunteerListString = volunteers.map(v =>
           `  - ID: ${v.id}, Skills: ${v.skills ? v.skills.join(', ') : 'None'}`
       ).join('\n');

       const prompt = `
          A volunteer task requires the following:
          Description: "${description}"
          Required Skills: ${requiredSkills ? requiredSkills.join(', ') : 'None specified'}

          Here is a list of available volunteers:
          ${volunteerListString}

          Based on the task description and required skills, identify the IDs of the most suitable volunteers from the list provided.
          Please return ONLY a valid JSON array containing the IDs of the matched volunteers, ordered from most suitable to least suitable.
          Example response format: ["volunteerId1", "volunteerId3"]
          If no volunteers are suitable, return an empty JSON array: []
       `;

       try {
           const model = genAI.getGenerativeModel({ model: "gemini-pro"}); 
           const result = await model.generateContent(prompt);
           const response = result.response;
           const llmResponseText = response.text();
           console.log("LLM response for matching:", llmResponseText);

           const matchedIds = safeJsonParse(llmResponseText);

           if (!Array.isArray(matchedIds)) {
               console.error("LLM did not return a valid JSON array of IDs. Response:", llmResponseText);
               return { matchedVolunteers: [] };
           }

           const matchedVolunteersMap = new Map(volunteers.map(v => [v.id, v]));
           const orderedMatchedVolunteers = matchedIds
               .map(id => matchedVolunteersMap.get(id))
               .filter(v => v !== undefined); 

           return { matchedVolunteers: orderedMatchedVolunteers };

       } catch (error) {
           console.error("Error during volunteer matching:", error);
           throw new GraphQLError("Failed to match volunteers.", { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
    }
  }
};

export default resolvers;