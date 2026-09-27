import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import { Services } from './pages/Services';
import { Reviews } from './pages/Reviews';
import { Gallery } from './pages/Gallery';
import { Requests } from './pages/Requests';
import { Contacts } from './pages/Contacts';
import './Dashboard.css';

export function Dashboard({ token }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchStats();
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, [token, navigate]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🚗 АМ Авто</h2>
          <p>Админ-панель</p>
        </div>

        <nav className="sidebar-menu">
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Главная
          </button>
          <button
            className={currentPage === 'services' ? 'active' : ''}
            onClick={() => setCurrentPage('services')}
          >
            🔧 Услуги
          </button>
          <button
            className={currentPage === 'reviews' ? 'active' : ''}
            onClick={() => setCurrentPage('reviews')}
          >
            ⭐ Отзывы
          </button>
          <button
            className={currentPage === 'gallery' ? 'active' : ''}
            onClick={() => setCurrentPage('gallery')}
          >
            📷 Галерея
          </button>
          <button
            className={currentPage === 'requests' ? 'active' : ''}
            onClick={() => setCurrentPage('requests')}
          >
            📝 Заявки
          </button>
          <button
            className={currentPage === 'contacts' ? 'active' : ''}
            onClick={() => setCurrentPage('contacts')}
          >
            📞 Контакты
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>👤 {user?.name || user?.email}</p>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Выход
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1>
            {currentPage === 'dashboard' && 'Главная'}
            {currentPage === 'services' && 'Управление услугами'}
            {currentPage === 'reviews' && 'Управление отзывами'}
            {currentPage === 'gallery' && 'Управление галереей'}
            {currentPage === 'requests' && 'Управление заявками'}
            {currentPage === 'contacts' && 'Контактная информация'}
          </h1>
        </div>

        <div className="content">
          {currentPage === 'dashboard' && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats?.services || 0}</div>
                <div className="stat-label">Услуг</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.reviews || 0}</div>
                <div className="stat-label">Одобренных отзывов</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.newRequests || 0}</div>
                <div className="stat-label">Новых заявок</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.galleryItems || 0}</div>
                <div className="stat-label">Фото в галерее</div>
              </div>
            </div>
          )}

          {currentPage === 'services' && <Services token={token} />}
          {currentPage === 'reviews' && <Reviews token={token} />}
          {currentPage === 'gallery' && <Gallery token={token} />}
          {currentPage === 'requests' && <Requests token={token} />}
          {currentPage === 'contacts' && <Contacts token={token} />}
        </div>
      </main>
    </div>
  );
}
