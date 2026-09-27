import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function Services({ token }) {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/services', {
        title,
        description,
        icon,
        order: services.length
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      setIcon('');
      fetchServices();
    } catch (err) {
      console.error('Ошибка добавления услуги:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await axios.delete(`/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchServices();
      } catch (err) {
        console.error('Ошибка удаления услуги:', err);
      }
    }
  };

  return (
    <div className="page">
      <div className="form-section">
        <h2>Добавить новую услугу</h2>
        <form onSubmit={handleAddService}>
          <input
            type="text"
            placeholder="Название услуги"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Описание услуги"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Иконка (emoji или URL)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </form>
      </div>

      <div className="list-section">
        <h2>Список услуг ({services.length})</h2>
        {services.map(service => (
          <div key={service._id} className="item-card">
            <div className="item-header">
              <span className="item-icon">{service.icon}</span>
              <h3>{service.title}</h3>
            </div>
            {service.description && <p>{service.description}</p>}
            <button
              className="delete-btn"
              onClick={() => handleDeleteService(service._id)}
            >
              ✕ Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
