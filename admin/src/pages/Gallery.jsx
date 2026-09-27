import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function Gallery({ token }) {
  const [gallery, setGallery] = useState([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get('/api/gallery');
      setGallery(response.data);
    } catch (err) {
      console.error('Ошибка загрузки галереи:', err);
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/gallery', {
        title,
        imageUrl,
        category,
        order: gallery.length
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setImageUrl('');
      setCategory('');
      fetchGallery();
    } catch (err) {
      console.error('Ошибка добавления фото:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await axios.delete(`/api/gallery/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGallery();
      } catch (err) {
        console.error('Ошибка удаления фото:', err);
      }
    }
  };

  return (
    <div className="page">
      <div className="form-section">
        <h2>Добавить фото в галерею</h2>
        <form onSubmit={handleAddPhoto}>
          <input
            type="text"
            placeholder="Название фото"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="url"
            placeholder="URL изображения"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Категория (опционально)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </form>
      </div>

      <div className="gallery-grid">
        {gallery.map(photo => (
          <div key={photo._id} className="gallery-item">
            <img src={photo.imageUrl} alt={photo.title} />
            <div className="gallery-info">
              <h3>{photo.title}</h3>
              {photo.category && <span className="category">{photo.category}</span>}
              <button
                className="delete-btn"
                onClick={() => handleDeletePhoto(photo._id)}
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
