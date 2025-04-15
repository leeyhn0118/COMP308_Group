import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema({
  userInput: String,
  aiResponse: String,
  suggestedQuestions: [String],
  relatedPostIds: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AIInteraction', aiInteractionSchema);
