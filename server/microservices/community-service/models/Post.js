import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  content: String,
  category: { type: String, enum: ['news', 'discussion'] },
  aiSummary: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

export default mongoose.model('Post', postSchema);
