import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: process.env.COMMUNITY_MONGO_URI || 'mongodb://localhost:27017/communityDB',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  port: process.env.COMMUNITY_PORT || 4003,
};
