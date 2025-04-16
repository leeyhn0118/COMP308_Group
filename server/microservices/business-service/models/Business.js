import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deal' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
}, { timestamps: true });

export default mongoose.model('Business', businessSchema);
