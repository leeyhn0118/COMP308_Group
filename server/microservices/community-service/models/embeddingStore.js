import mongoose from 'mongoose';

const embeddingStoreSchema = new mongoose.Schema({
  type: { type: String, enum: ['post', 'help'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: String,
  embedding: [Number]
});

export default mongoose.model('EmbeddingStore', embeddingStoreSchema);
