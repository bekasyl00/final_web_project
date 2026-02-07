const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed'],
      default: 'draft'
    },
    capacity: {
      type: Number,
      min: 1
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
