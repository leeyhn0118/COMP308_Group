import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.db);
    console.log(`✅ Community Service connected to MongoDB at ${config.db}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB (Community Service):', error.message);
    process.exit(1);
  }
};

export default connectDB;
