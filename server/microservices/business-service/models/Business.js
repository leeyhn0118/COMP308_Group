import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
    },

    address: {
        street: String,
        city: String,
        province: String,
        postalCode: String,
    },

    contact: {
        phone: String,
        email: String,
        website: String,
    },

    category: {
        type: String,
        required: true,
        enum: ['Retail', 'Service', 'Salon', 'Restaurant', 'Entertainment', 'Other'],
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      },

      operatingHours: String,
}, { timestamp: true});

const Business = mongoose.model('Business', businessSchema);

export default Business;