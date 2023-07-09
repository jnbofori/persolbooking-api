const mongoose = require('mongoose');
const { Types } = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
  },
  facilityType: {
    type: Types.ObjectId,
    required: true,
    ref: 'FacilityType'
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'deleted']
  },
  createdBy: {
    type: Types.ObjectId,
    required: true,
    ref: 'Admin'
  },
  modifiedBy: {
    type: Types.ObjectId,
    required: false,
    ref: 'Admin'
  },
}, {
  timestamps: {
    createdAt: "created",
    updatedAt: "modified"
  }
});

facilitySchema.index({ "$**": "text" });

module.exports = mongoose.model('Facility', facilitySchema);