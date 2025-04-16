import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  title: String,
  description: String,
  discountPercentage: Number,
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);
