import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  targetType: { 
    type: String,
    required: true,
    enum: ['Business', 'Event'],
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' 
  },

  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  comment: {
    type: String,
    required: true,
  },

  sentiment: { 
    type: String,
    enum: ['positive', 'negative', 'neutral', 'mixed', null],
    default: null,
  },

  sentimentScore: Number, 
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;