import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  business: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  title: { 
    type: String,
    required: true,
    trim: true,
  },
  description: { 
    type: String,
    required: true,
  },
  startDate: { 
    type: Date,
    default: Date.now,
  },
  endDate: { 
    type: Date,
  },
  promoCode: { 
    type: String,
    trim: true,
  },
  terms: String, 
}, { timestamps: true });

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;