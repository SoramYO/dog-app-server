const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  species: {
    type: String,
    required: true,
    enum: ['dog', 'cat'],
    lowercase: true
  },
  breed: {
    type: String,
    trim: true,
    index: true
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Birth date cannot be in the future'
    }
  },
  weight: {
    type: Number,
    min: 0,
    max: 200 // in kg
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  medicalInfo: {
    vaccinations: [{
      name: String,
      date: Date,
      nextDueDate: Date
    }],
    allergies: [String],
    conditions: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
petSchema.index({ userId: 1, name: 1 });
petSchema.index({ species: 1, breed: 1 });

module.exports = mongoose.model('Pet', petSchema);