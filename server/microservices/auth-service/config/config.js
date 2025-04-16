import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: process.env.AUTH_MONGO_URI || "mongodb://localhost:27017/authServiceDB",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret",
  port: process.env.AUTH_PORT || 4001,
};

