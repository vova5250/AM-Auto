const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const authMiddleware = require('../middleware/auth');

// Получить все заявки (для админов)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новую заявку (от клиентов через форму)
router.post('/', async (req, res) => {
  try {
    const { name, phone, carModel, problem } = req.body;
    const request = new Request({ name, phone, carModel, problem });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить статус заявки
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить заявку
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Заявка удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
