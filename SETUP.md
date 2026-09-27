# 🚀 Запуск проекта локально

## Требования
- Node.js (v14+)
- MongoDB (локально или MongoDB Atlas облако)
- npm

## Шаг 1: Установка зависимостей

```bash
# Основные зависимости проекта
npm install

# Установить зависимости админ-панели
cd admin && npm install && cd ..
```

## Шаг 2: Конфигурация

Создайте файл `.env` в корневой директории:

```
MONGODB_URI=mongodb://localhost:27017/am-auto
JWT_SECRET=super-secret-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

**Или используйте MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/am-auto
```

## Шаг 3: Запуск MongoDB

### Локально (если установлена):
```bash
mongod
```

### Облачно (MongoDB Atlas):
Просто используйте connection string в `.env`

## Шаг 4: Запуск проекта

### Вариант 1: Запустить backend и админку вместе

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Admin Panel):
```bash
cd admin
npm start
```

### Вариант 2: Только backend (быстрый тест)
```bash
npm run dev
```

## Шаг 5: Вход в админ-панель

После запуска админ-панель откроется на `http://localhost:3000`

**Данные для входа (нужно создать в БД):**
- Email: `admin@amauto.ru`
- Password: `admin123`

## Как создать первого администратора

### Способ 1: Через MongoDB Compass или Atlas

1. Откройте MongoDB Compass
2. Подключитесь к БД `am-auto`
3. В коллекции `users` нажмите "Insert Document"
4. Вставьте JSON (предварительно хешируя пароль)

### Способ 2: Через Node скрипт

```bash
# Хешируем пароль
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10))"
```

Скопируйте результат и вставьте в MongoDB:

```javascript
db.users.insertOne({
  email: "admin@amauto.ru",
  password: "$2a$10/...", // сюда вставьте хеш
  name: "Администратор",
  role: "admin",
  createdAt: new Date()
})
```

## API доступен на:
- Backend: `http://localhost:5000/api`
- Admin Panel: `http://localhost:3000`
- Public Site: `http://localhost:5000`

## Решение проблем

### Ошибка "Cannot find module 'express'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### MongoDB не подключается
- Убедитесь, что сервис MongoDB запущен
- Проверьте `MONGODB_URI` в `.env`
- Для MongoDB Atlas проверьте IP whitelist

### React админка не загружается
```bash
cd admin
rm -rf node_modules package-lock.json
npm install
npm start
```

## ✨ Функциональность админ-панели

После входа вы сможете:
- ✅ Управлять услугами (добавлять, удалять)
- ✅ Модерировать отзывы клиентов
- ✅ Управлять галереей фото
- ✅ Отслеживать заявки от клиентов
- ✅ Редактировать контактную информацию

## 🎉 Готово!

Теперь ваш проект полностью функционален и готов к использованию!
