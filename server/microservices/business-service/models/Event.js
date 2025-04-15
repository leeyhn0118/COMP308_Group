import mongoose from 'mongoose';

const requiredVolunteerSchema = new mongoose.Schema({
    role: { type: String, required: true },
    count: { type: Number, required: true },
  }, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true,
    trim: true,
  },

  description: { 
    type: String,
    required: true,
  },

  date: { 
    type: Date,
    required: true,
  },

  startTime: String, 
  endTime: String,   

  location: { 
    name: String,
    address: String,
  },

  organizer: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  category: { 
    type: String,
    enum: ['Community', 'Workshop', 'Festival', 'Volunteer', 'Other'],
  },

  requiredVolunteers: [requiredVolunteerSchema], 
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;