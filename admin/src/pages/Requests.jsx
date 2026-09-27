import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export function Requests({ token }) {
  const [requests, setRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('new');

  const fetchRequests = useCallback(async () => {
    try {
      const response = await axios.get('/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/requests/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      console.error('Ошибка обновления заявки:', err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await axios.delete(`/api/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchRequests();
      } catch (err) {
        console.error('Ошибка удаления заявки:', err);
      }
    }
  };

  const filteredRequests = requests.filter(r => r.status === selectedStatus);

  const statusLabels = {
    'new': '📬 Новые',
    'in_progress': '⏳ В работе',
    'completed': '✅ Завершены',
    'rejected': '❌ Отклонены'
  };

  return (
    <div className="page">
      <div className="tabs">
        {Object.entries(statusLabels).map(([status, label]) => (
          <button
            key={status}
            className={selectedStatus === status ? 'active' : ''}
            onClick={() => setSelectedStatus(status)}
          >
            {label} ({requests.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      <div className="list-section">
        {filteredRequests.map(request => (
          <div key={request._id} className="item-card">
            <div className="request-header">
              <h3>👤 {request.name}</h3>
              <span className="badge">{request.status}</span>
            </div>
            <p><strong>📞 Телефон:</strong> {request.phone}</p>
            <p><strong>🚗 Автомобиль:</strong> {request.carModel || 'Не указан'}</p>
            <p><strong>🔧 Проблема:</strong> {request.problem}</p>
            <p><small>📅 {new Date(request.createdAt).toLocaleDateString('ru-RU')}</small></p>
            
            <div className="button-group">
              <select
                value={request.status}
                onChange={(e) => handleUpdateStatus(request._id, e.target.value)}
              >
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершена</option>
                <option value="rejected">Отклонена</option>
              </select>
              <button
                className="delete-btn"
                onClick={() => handleDeleteRequest(request._id)}
              >
                ✕ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
