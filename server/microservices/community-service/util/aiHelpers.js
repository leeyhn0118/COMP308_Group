import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import ChatMemory from '../models/chatMemory.js';
import EmbeddingStore from '../models/embeddingStore.js';

const embedModel = new GoogleGenerativeAIEmbeddings({
  model: 'embedding-001',
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateEmbedding(text) {
  return await embedModel.embedQuery(text);
}

export async function saveEmbedding(text, type, referenceId) {
  const embedding = await generateEmbedding(text);
  await EmbeddingStore.create({ type, referenceId, text, embedding });
}

export async function getChatHistory(sessionId) {
  const history = await ChatMemory.find({ sessionId }).sort({ createdAt: 1 });
  return history.map(h => `User: ${h.question}\nAI: ${h.answer}`).join('\n');
}

export async function saveToMemory(sessionId, question, answer) {
  await ChatMemory.create({ sessionId, question, answer });
}

export function randomFollowUps(input) {
  const suggestions = [
    `Would you like help related to "${input}"?`,
    `Want to know more about "${input}"?`,
    `Should I explain "${input}" in another way?`,
    `Can I show similar posts or help requests about "${input}"?`,
  ];
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, 2);
}
