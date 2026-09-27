const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const authMiddleware = require('../middleware/auth');

// Получить все услуги
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить услугу (только для авторизированных)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, icon, order } = req.body;
    const service = new Service({ title, description, icon, order });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить услугу
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить услугу
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
