import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  content: String,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
