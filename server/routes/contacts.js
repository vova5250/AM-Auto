const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/auth');

// Получить контактную информацию
router.get('/', async (req, res) => {
  try {
    const contact = await Contact.findOne({});
    if (!contact) {
      return res.json({
        phone: '+7 (999) 999-99-99',
        email: 'info@amauto.ru',
        address: 'Краснодар',
        workingHours: 'Пн-Сб: 9:00-18:00, Вс: выходной',
        description: 'Профессиональная автоэлектрика в Краснодаре'
      });
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить контактную информацию (только для админов)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { phone, email, address, workingHours, description } = req.body;
    let contact = await Contact.findOne({});
    
    if (!contact) {
      contact = new Contact({ phone, email, address, workingHours, description });
    } else {
      contact.phone = phone || contact.phone;
      contact.email = email || contact.email;
      contact.address = address || contact.address;
      contact.workingHours = workingHours || contact.workingHours;
      contact.description = description || contact.description;
      contact.updatedAt = new Date();
    }
    
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
