const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const authMiddleware = require('../middleware/auth');

// Получить одобренные отзывы
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить все отзывы (только для админов)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить отзыв (от клиентов)
router.post('/', async (req, res) => {
  try {
    const { name, text, rating } = req.body;
    const review = new Review({ name, text, rating });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Одобрить отзыв
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить отзыв
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Отзыв удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
