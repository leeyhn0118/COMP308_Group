import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: process.env.AI_MONGO_URI || 'mongodb://localhost:27017/aiServiceDB',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  port: process.env.AI_PORT || 4004,
};