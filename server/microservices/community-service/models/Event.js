import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: String,
  endTime: String,
  location: { name: String, address: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Community', 'Workshop', 'Festival', 'Volunteer', 'Other'] },
  requiredVolunteers: [{ role: String, count: Number }],
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
