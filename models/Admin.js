const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    min: 2
  },
  lastname: {
    type: String,
    required: true,
    min: 3
  },
  email: {
    type: String,
    required: true,
    min: 6
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6
  },
});


module.exports = mongoose.model('Admin', adminSchema);