const mongoose = require('mongoose');
const { Types } = require('mongoose');

const facilityTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
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

facilityTypeSchema.index({ "$**": "text" });

module.exports = mongoose.model('FacilityType', facilityTypeSchema);