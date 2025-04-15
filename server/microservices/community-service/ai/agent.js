import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { PromptTemplate } from '@langchain/core/prompts';
import Post from '../models/Post.js';
import HelpRequest from '../models/HelpRequest.js';
import { randomFollowUps } from '../util/aiHelpers.js';

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 1024,
});

export async function handleAICommunity(input, userId) {
  const lowerInput = input.toLowerCase();
  const keywords = lowerInput.split(/\s+/).filter(Boolean);

  const posts = await Post.find({}).lean();
  const helps = await HelpRequest.find({}).lean();

  const isShowAllPosts = lowerInput.includes('all') && lowerInput.includes('post');
  const isPostTitleQuery = lowerInput.includes('post') && lowerInput.includes('title');
  const isPostQuery = lowerInput.includes('post');
  const isShowAllHelps = lowerInput.includes('all') && (lowerInput.includes('help') || lowerInput.includes('request'));
  const isHelpQuery = ['help', 'request', 'location', 'resolved', 'unresolved'].some(k => lowerInput.includes(k));

  const filteredPosts = isShowAllPosts
  ? posts
  : isPostTitleQuery
  ? posts.filter((p) => p.title?.toLowerCase() === keywords.at(-1)) 
  : lowerInput.includes('post')
  ? posts.filter(
      (p) =>
        lowerInput.includes(p.title?.toLowerCase()) ||
        lowerInput.includes(p.content?.toLowerCase()) ||
        lowerInput.includes(p.category?.toLowerCase())
    )
  : [];



  const filteredHelps =
    isShowAllHelps
      ? helps
      : isHelpQuery
      ? helps.filter((h) => {
          const locationMatch = h.location && lowerInput.includes(h.location.toLowerCase());
          const resolvedMatch = (lowerInput.includes('yes') || lowerInput.includes('resolved')) && h.isResolved === true;
          const unresolvedMatch = (lowerInput.includes('no') || lowerInput.includes('unresolved')) && h.isResolved === false;
          const descriptionMatch = h.description && lowerInput.includes(h.description.toLowerCase());
          return locationMatch || resolvedMatch || unresolvedMatch || descriptionMatch;
        })
      : [];

  // Only embed documents based on query type
  const documents = [];

  if (isPostQuery || isShowAllPosts) {
    documents.push(
      ...filteredPosts.map(
        (p) =>
          new Document({
            pageContent: `Title: ${p.title}\nContent: ${p.content}\nCategory: ${p.category}\nAuthor: ${p.author}`,
            metadata: { type: 'post', ...p },
          })
      )
    );
  }

  if (isHelpQuery || isShowAllHelps) {
    documents.push(
      ...filteredHelps.map(
        (h) =>
          new Document({
            pageContent: `Description: ${h.description}\nLocation: ${h.location || 'N/A'}\nResolved: ${
              h.isResolved ? 'Yes' : 'No'
            }\nAuthor: ${h.author}`,
            metadata: { type: 'help', ...h },
          })
      )
    );
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GEMINI_API_KEY });
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
  const retriever = vectorStore.asRetriever();

  const prompt = PromptTemplate.fromTemplate(`
    You are a helpful AI assistant. Based on the context, answer the user's question clearly and concisely.
    
    Context:
    {context}
    
    User question:
    {input}
    
    Instructions:
    - If the input is vague, ask for clarification in a short, natural sentence.
    - If relevant info is available, summarize it briefly and clearly.
    - Avoid repeating the question or content unnecessarily.
    - If nothing relevant is found, gently let the user know.
  `);

  const combineDocsChain = await createStuffDocumentsChain({ llm, prompt });
  const chain = await createRetrievalChain({ retriever, combineDocsChain });

  const result = await chain.invoke({ input });
  const answer = result.answer;

  const results = await vectorStore.similaritySearchWithScore(input, 10);
  const relevantDocs = results.map(([doc]) => doc);

  const retrievedPosts = [];
  const retrievedHelps = [];

  relevantDocs.forEach((doc) => {
    const data = doc.metadata;
    if (data.type === 'post') {
      if (isPostTitleQuery && !lowerInput.includes(data.title?.toLowerCase())) return;
      retrievedPosts.push({
        id: data._id?.toString(),
        title: data.title,
        content: data.content,
        category: data.category,
        author: data.author,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    } else if (data.type === 'help') {
      retrievedHelps.push({
        id: data._id?.toString(),
        description: data.description,
        location: data.location,
        isResolved: data.isResolved,
        volunteers: data.volunteers,
        author: data.author,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }
  });

  return {
    text: answer,
    summary: `Summary: ${answer.split('. ')[0]}.`,
    suggestedQuestions: randomFollowUps(input),
    retrievedPosts,
    retrievedHelps,
  };
}
