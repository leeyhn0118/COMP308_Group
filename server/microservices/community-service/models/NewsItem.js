import mongoose from 'mongoose';

const newsItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  source: { type: String },
  publicationDate: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['Local', 'Safety', 'Event', 'Traffic', 'Other'],
    default: 'Local',
  },
  summary: { type: String },
}, { timestamps: true });

export default mongoose.model('NewsItem', newsItemSchema);
