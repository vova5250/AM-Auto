const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Admin dashboard информация
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const Service = require('../models/Service');
    const Review = require('../models/Review');
    const Request = require('../models/Request');
    const Gallery = require('../models/Gallery');

    const stats = {
      services: await Service.countDocuments(),
      reviews: await Review.countDocuments({ approved: true }),
      newRequests: await Request.countDocuments({ status: 'new' }),
      galleryItems: await Gallery.countDocuments()
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
