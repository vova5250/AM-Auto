const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  carModel: String,
  problem: String,
  status: { type: String, enum: ['new', 'in_progress', 'completed', 'rejected'], default: 'new' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
