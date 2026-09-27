# 🚗 АМ Авто - Автоэлектрик в Краснодаре

Полнофункциональный веб-сайт для компании автоэлектрики с админ-панелью для управления контентом.

## 🎯 Структура проекта

```
project/
├── public/              # Исходный сайт (HTML/CSS/JS)
├── server/              # Backend (Node.js + Express)
│   ├── models/          # MongoDB модели
│   ├── routes/          # REST API endpoints
│   ├── middleware/      # Аутентификация
│   └── server.js        # Главный файл
├── admin/               # React админ-панель
│   └── src/
│       ├── pages/       # Страницы админки
│       ├── App.jsx
│       └── Login.jsx
└── package.json         # Зависимости проекта
```

## ⚡ Быстрый старт

### 1. Установка зависимостей

```bash
# Установить зависимости для backend
npm install

# Установить зависимости для админ-панели
cd admin
npm install
cd ..
```

### 2. Конфигурация

Скопируйте `.env.example` в `.env` и отредактируйте:

```bash
cp .env.example .env
```

Отредактируйте файл `.env`:
- `MONGODB_URI` - ссылка на MongoDB
- `JWT_SECRET` - секретный ключ для токенов
- `PORT` - порт сервера

### 3. Запуск MongoDB

```bash
# Если MongoDB уже установлена локально
mongod
```

Или используйте MongoDB Atlas (облачная база):
```
mongodb+srv://user:password@cluster.mongodb.net/am-auto
```

### 4. Создание первого администратора

Откройте консоль Node.js в папке проекта:

```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log('Encrypted password:', hash);
console.log('Используйте этот хеш в БД для пользователя admin@amauto.ru');
"
```

Добавьте в MongoDB вручную:

```javascript
db.users.insertOne({
  email: "admin@amauto.ru",
  password: "хеш_пароля_из_выше",
  name: "Администратор",
  role: "admin",
  createdAt: new Date()
})
```

### 5. Запуск проекта

#### Запуск только backend:
```bash
npm run dev
```

#### Запуск админ-панели отдельно:
```bash
cd admin
npm start
```

#### Запуск обоих (в разных терминалах):

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
cd admin && npm start
```

## 📚 Функциональность

### Клиентская часть (Публичный сайт)
- 🏠 Главная страница
- 🔧 Описание услуг
- ⭐ Отзывы клиентов
- 📝 Форма записи на диагностику
- 📱 Адаптивный дизайн

### Админ-панель
- 🔐 Аутентификация (JWT токены)
- 🔧 Управление услугами
- ⭐ Управление отзывами (модерация)
- 📷 Управление галереей фото
- 📝 Управление заявками клиентов
- 📞 Редактирование контактной информации
- 📊 Статистика и аналитика

## 🛠️ API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Информация о пользователе

### Услуги
- `GET /api/services` - Получить все услуги
- `POST /api/services` - Добавить услугу
- `PUT /api/services/:id` - Обновить услугу
- `DELETE /api/services/:id` - Удалить услугу

### Отзывы
- `GET /api/reviews` - Получить одобренные отзывы
- `POST /api/reviews` - Добавить отзыв
- `PUT /api/reviews/:id/approve` - Одобрить отзыв
- `DELETE /api/reviews/:id` - Удалить отзыв

### Галерея
- `GET /api/gallery` - Получить все фото
- `POST /api/gallery` - Добавить фото
- `DELETE /api/gallery/:id` - Удалить фото

### Заявки
- `GET /api/requests` - Получить все заявки
- `POST /api/requests` - Создать заявку
- `PUT /api/requests/:id` - Обновить заявку

### Контакты
- `GET /api/contacts` - Получить контакты
- `PUT /api/contacts` - Обновить контакты

## 🔐 Безопасность

- Пароли хешируются с bcryptjs
- JWT токены для аутентификации (срок действия 7 дней)
- CORS для контроля доступа
- Защита endpoint'ов админ-функций

## 📱 Технологический стек

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT для аутентификации
- bcryptjs для хеширования паролей

**Frontend (админ-панель):**
- React 18
- React Router для навигации
- Axios для API запросов
- CSS Grid и Flexbox для верстки

## 🚀 Развертывание

### На Heroku
```bash
heroku create am-auto
git push heroku main
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
```

### На VPS (DigitalOcean, Linode и т.д.)
1. Установите Node.js
2. Установите MongoDB
3. Клонируйте репозиторий
4. Запустите `npm install && cd admin && npm install && cd ..`
5. Настройте `.env`
6. Используйте PM2 или systemd для управления процессом

## 📝 Лицензия

MIT

## 👨‍💻 Автор

АМ Авто - Профессиональная автоэлектрика в Краснодаре
