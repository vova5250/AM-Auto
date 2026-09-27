import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function Contacts({ token }) {
  const [contacts, setContacts] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    workingHours: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts');
      setContacts(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Ошибка загрузки контактов:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/contacts', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Ошибка сохранения контактов:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <p>Загрузка...</p>;

  return (
    <div className="page">
      <div className="form-section">
        <h2>Контактная информация</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📞 Телефон</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>📍 Адрес</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>⏰ График работы</label>
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours}
              placeholder="Пн-Сб: 9:00-18:00, Вс: выходной"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>📝 Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {saved && <div className="success-message">✓ Данные сохранены!</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}
