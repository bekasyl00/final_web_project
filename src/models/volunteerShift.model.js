const mongoose = require('mongoose');

const volunteerShiftSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['subscribed', 'cancelled'],
      default: 'subscribed'
    },
    reminderHours: {
      type: Number,
      default: 24,
      min: 1,
      max: 168
    },
    reminderSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VolunteerShift', volunteerShiftSchema);
