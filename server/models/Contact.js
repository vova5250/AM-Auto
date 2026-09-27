const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  phone: String,
  email: String,
  address: String,
  workingHours: String,
  description: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
