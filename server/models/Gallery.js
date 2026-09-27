const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: { type: String, required: true },
  category: String,
  order: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
