const mongoose = require('mongoose');
const { Types } = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    min: 2
  },
  lastname: {
    type: String,
    required: true,
    min: 2
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6
  },
  department: {
    type: String,
    required: true,
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
});

employeeSchema.index({ "$**": "text" });

module.exports = mongoose.model('Employee', employeeSchema);