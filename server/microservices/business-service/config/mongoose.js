import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.db);
    console.log(`✅ Connected to MongoDB at ${config.db}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
