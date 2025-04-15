import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: process.env.BUSINESS_MONGO_URI || 'mongodb://localhost:27017/businessServiceDB',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  port: process.env.BUSINESS_PORT || 4003,
};