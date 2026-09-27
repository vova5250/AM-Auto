const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const authMiddleware = require('../middleware/auth');

// Получить все фото
router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ order: 1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить фото в галерею
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, imageUrl, category, order } = req.body;
    const photo = new Gallery({ title, description, imageUrl, category, order });
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить фото
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить фото
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Фото удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
