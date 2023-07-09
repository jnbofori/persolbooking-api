const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Facility'
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Employee'
  },
  department: {
    type: String,
    required: false
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'deleted']
  },
}, {
  timestamps: {
    createdAt: "created",
    updatedAt: "modified"
  }
});


module.exports = mongoose.model('Booking', bookingSchema);