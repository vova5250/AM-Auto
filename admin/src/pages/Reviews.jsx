import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function Reviews({ token }) {
  const [reviews, setReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('approved');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const [approvedRes, allRes] = await Promise.all([
        axios.get('/api/reviews'),
        axios.get('/api/reviews/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      setReviews(approvedRes.data);
      setPendingReviews(allRes.data.filter(r => !r.approved));
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
    }
  };

  const handleApproveReview = async (id) => {
    try {
      await axios.put(`/api/reviews/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err) {
      console.error('Ошибка одобрения отзыва:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await axios.delete(`/api/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchReviews();
      } catch (err) {
        console.error('Ошибка удаления отзыва:', err);
      }
    }
  };

  return (
    <div className="page">
      <div className="tabs">
        <button
          className={activeTab === 'approved' ? 'active' : ''}
          onClick={() => setActiveTab('approved')}
        >
          ✅ Одобренные ({reviews.length})
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ На проверке ({pendingReviews.length})
        </button>
      </div>

      <div className="list-section">
        {activeTab === 'approved' && reviews.map(review => (
          <div key={review._id} className="item-card">
            <div className="review-header">
              <strong>{review.name}</strong>
              <span className="rating">{'⭐'.repeat(review.rating)}</span>
            </div>
            <p>{review.text}</p>
            <small>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</small>
            <button
              className="delete-btn"
              onClick={() => handleDeleteReview(review._id)}
            >
              ✕ Удалить
            </button>
          </div>
        ))}

        {activeTab === 'pending' && pendingReviews.map(review => (
          <div key={review._id} className="item-card pending">
            <div className="review-header">
              <strong>{review.name}</strong>
              <span className="rating">{'⭐'.repeat(review.rating)}</span>
            </div>
            <p>{review.text}</p>
            <small>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</small>
            <div className="button-group">
              <button
                className="approve-btn"
                onClick={() => handleApproveReview(review._id)}
              >
                ✓ Одобрить
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteReview(review._id)}
              >
                ✕ Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
