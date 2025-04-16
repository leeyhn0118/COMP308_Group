import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4004/graphql';

export async function callAiService(query, variables) {
  try {
    const response = await axios.post(AI_SERVICE_URL, {
      query,
      variables,
    }, { headers: { 'Content-Type': 'application/json' } });

    if (response.errors) {
      throw new Error(response.errors[0]?.message || 'AI service error');
    }

    return response.data;
  } catch (error) {
    console.error("AI service error:", error);
    throw new Error("Failed to communicate with AI service");
  }
}
