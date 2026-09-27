# 🌐 Развертывание проекта на хостинг

Выбери один из вариантов ниже в зависимости от твоего бюджета и потребностей.

---

## 📊 Сравнение вариантов

| Хостинг | Цена | Сложность | Рекомендация |
|---------|------|-----------|-------------|
| **Render** | Бесплатно/5-7$ | ⭐⭐ Легко | ✅ **ЛУЧШИЙ вариант** |
| **Railway** | Бесплатно/5$ | ⭐ Очень легко | ✅ Хороший вариант |
| **Heroku** | От 7$ | ⭐⭐ Легко | ⚠️ Платный |
| **DigitalOcean** | 5-6$ | ⭐⭐⭐ Сложнее | 💪 Для профи |
| **Vercel + Render** | Бесплатно | ⭐⭐⭐ Чуть сложнее | 🚀 Отдельно фронт/бэк |

---

## 🎯 ВАРИАНТ 1: Render.com (РЕКОМЕНДУЕТСЯ)

### Преимущества:
- ✅ Бесплатный tier с неограниченной базой данных
- ✅ Автодеплой из GitHub
- ✅ MongoDB встроена
- ✅ Легко масштабировать
- ✅ SSL сертификат бесплатно

### Шаг 1: Подготовка GitHub

```bash
# Убедись что всё залито на GitHub
git push origin vova5250-add-admin-panel

# Смотри на GitHub репозиторий: https://github.com/vova5250/yuzhny-reserve
```

### Шаг 2: Создание MongoDB базы на Render

1. Перейди на https://render.com
2. Нажми **"+ New" → "Database" → "MongoDB"**
3. Выбери:
   - Name: `am-auto-db`
   - Region: `Frankfurt` или `Singapore` (ближайший к тебе)
   - Plan: **Free** ✅
4. Нажми **"Create Database"**
5. Скопируй строку подключения (Connection String)

### Шаг 3: Развертывание Backend

1. На Render нажми **"+ New" → "Web Service"**
2. Подключи свой GitHub репозиторий
3. Заполни поля:
   - **Name**: `am-auto-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd admin && npm install && cd ..`
   - **Start Command**: `npm start`
   - **Branch**: `vova5250-add-admin-panel`

4. **Environment Variables** - добавь:
   ```
   MONGODB_URI=<скопированная строка из шага 2>
   JWT_SECRET=super-secret-key-change-this-in-production-abc123xyz
   NODE_ENV=production
   PORT=5000
   ```

5. Нажми **"Create Web Service"**
6. Ждите ~5 минут пока развернется
7. Скопируй URL вида `https://am-auto-api-xxxx.onrender.com`

### Шаг 4: Развертывание Админ-панели

Есть 2 способа:

#### Способ A: Деплой админки на Render (простой)

1. Нажми **"+ New" → "Static Site"**
2. Подключи репозиторий
3. Заполни:
   - **Name**: `am-auto-admin`
   - **Build Command**: `cd admin && npm run build`
   - **Publish Directory**: `admin/build`
   - **Branch**: `vova5250-add-admin-panel`

4. Нажми **"Create Static Site"**
5. После деплоя будет URL для админки

#### Способ B: Деплой админки как отдельного сервиса (лучше)

```bash
# Это запустит админку на том же домене что и backend
# Просто используй статичный сервис из Render
```

### Шаг 5: Обновление конфигурации в админке

Отредактируй файл `admin/src/App.jsx` чтобы он указывал на правильный API:

```jsx
// Добавь в начало файла
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// И используй это в axios запросах
axios.create({ baseURL: API_URL });
```

Или создай файл `admin/.env.production`:

```
REACT_APP_API_URL=https://am-auto-api-xxxx.onrender.com/api
```

### Готово! ✅

Твой проект будет доступен по ссылкам:
- 🌐 **Сайт**: `https://am-auto-api-xxxx.onrender.com`
- 🔐 **Админка**: `https://am-auto-admin-xxxx.onrender.com` или встроена на сайт

---

## 🚂 ВАРИАНТ 2: Railway.app (ОЧЕНЬ ЛЕГКО)

### Шаг 1: Регистрация

1. Перейди на https://railway.app
2. Подключи GitHub аккаунт

### Шаг 2: Создание проекта

1. Нажми **"+ New Project"**
2. Выбери **"Deploy from GitHub repo"**
3. Выбери репозиторий `yuzhny-reserve`
4. Выбери ветку `vova5250-add-admin-panel`

### Шаг 3: Добавление MongoDB

1. В левом меню нажми **"+ Add"**
2. Выбери **"MongoDB"**
3. Нажми **"Create"** (они автоматически настроят переменные окружения!)

### Шаг 4: Конфигурация переменных окружения

1. Перейди в **"Variables"**
2. Добавь:
   ```
   JWT_SECRET=super-secret-key-abc123xyz
   NODE_ENV=production
   PORT=5000
   ```

3. **ВАЖНО**: Переменная `MONGODB_URI` уже будет автоматически создана!

### Шаг 5: Развертывание

1. Railway автоматически запустит деплой
2. Когда увидишь зелёную галочку - проект готов!
3. Скопируй URL из **"Domains"**

### Готово! ✅

Всё ещё проще чем Render!

---

## 🔵 ВАРИАНТ 3: Heroku (классический, но платный)

### Требования:
- Кредитная карта (от 7$ в месяц)
- Heroku CLI установлена

### Шаг 1: Установка Heroku CLI

```bash
# Windows
choco install heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Шаг 2: Вход в Heroku

```bash
heroku login
```

### Шаг 3: Создание приложений

```bash
# Backend
heroku create am-auto-api
cd .
heroku create am-auto-admin

# Вернись в корневую папку
cd ..
```

### Шаг 4: Добавление MongoDB (MongoDB Atlas)

1. Перейди на https://www.mongodb.com/cloud/atlas
2. Создай бесплатный кластер
3. Скопируй connection string

### Шаг 5: Настройка переменных окружения

```bash
# Backend
heroku config:set --app am-auto-api MONGODB_URI="твоя_строка_подключения"
heroku config:set --app am-auto-api JWT_SECRET="super-secret-key"
heroku config:set --app am-auto-api NODE_ENV="production"

# Admin
heroku config:set --app am-auto-admin REACT_APP_API_URL="https://am-auto-api.herokuapp.com"
```

### Шаг 6: Деплой

```bash
# Backend
git push heroku vova5250-add-admin-panel:main -u am-auto-api

# Admin
cd admin
git subtree push --prefix admin heroku main -u am-auto-admin
cd ..
```

---

## 💻 ВАРИАНТ 4: DigitalOcean (VPS - для профессионалов)

### Требования:
- Знания Linux
- SSH доступ
- ~5-6$ в месяц

### Шаг 1: Создание Droplet

1. Перейди https://www.digitalocean.com
2. Нажми **"Create" → "Droplets"**
3. Выбери:
   - Image: **Ubuntu 22.04**
   - Size: **Basic $5/month**
   - Region: Выбери ближайший
   - Нажми **"Create Droplet"**

### Шаг 2: Подключение по SSH

```bash
ssh root@твой_ip_адрес
```

### Шаг 3: Установка зависимостей

```bash
# Обновление системы
apt update && apt upgrade -y

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Git
apt install -y git

# PM2 (для управления процессами)
npm install -g pm2
```

### Шаг 4: Клонирование проекта

```bash
cd /var/www
git clone https://github.com/vova5250/yuzhny-reserve.git
cd yuzhny-reserve
git checkout vova5250-add-admin-panel
```

### Шаг 5: Установка зависимостей

```bash
npm install
cd admin && npm install && npm run build && cd ..
```

### Шаг 6: Конфигурация .env

```bash
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/am-auto
JWT_SECRET=super-secret-key-abc123xyz
NODE_ENV=production
PORT=5000
EOF
```

### Шаг 7: Запуск с PM2

```bash
pm2 start server/server.js --name "am-auto"
pm2 startup
pm2 save
```

### Шаг 8: Nginx (для прокси)

```bash
apt install -y nginx

cat > /etc/nginx/sites-available/am-auto << 'EOF'
server {
    listen 80;
    server_name твой_домен.рф;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/am-auto /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Шаг 9: SSL сертификат (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d твой_домен.рф
```

---

## 🚀 ВАРИАНТ 5: Vercel + Render (Оптимально для production)

### Идея:
- **Фронтенд (Админка)**: Vercel (быстрая, бесплатно)
- **Бэкенд + БД**: Render (бесплатно)

### Шаг 1: Развертывание Backend на Render

Следи инструкции из **ВАРИАНТ 1** выше.

### Шаг 2: Развертывание Frontend на Vercel

1. Перейди https://vercel.com
2. Нажми **"Import Project"**
3. Выбери **"Import Git Repository"**
4. Выбери репозиторий `yuzhny-reserve`
5. Нажми **"Next"**

6. В **"Root Directory"** напиши: `admin`
7. В **"Build Command"**: `npm run build`
8. В **"Output Directory"**: `build`

9. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://am-auto-api-xxxx.onrender.com
   ```

10. Нажми **"Deploy"**
11. Ждите деплоя (~2-3 минуты)

---

## ✅ Финальная чек-лист

Перед деплоем убедись:

- [ ] Все файлы залиты на GitHub
- [ ] `.env` файл НЕ залит в гит (в `.gitignore`)
- [ ] `package.json` содержит `"start": "node server/server.js"`
- [ ] Админка строит корректно (`npm run build` работает)
- [ ] Все переменные окружения указаны

---

## 🔗 Полезные ссылки

- [Render документация](https://render.com/docs)
- [Railway документация](https://docs.railway.app/)
- [Heroku документация](https://devcenter.heroku.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [DigitalOcean документация](https://docs.digitalocean.com/)
- [Vercel документация](https://vercel.com/docs)

---

## 🆘 Решение проблем

### Проблема: "Cannot find module 'express'"
```bash
# На хостинге
npm install
```

### Проблема: MongoDB не подключается
- Проверь `MONGODB_URI` в переменных окружения
- Убедись что IP адрес хостинга добавлен в MongoDB Atlas whitelist

### Проблема: Админка не загружается
- Проверь `REACT_APP_API_URL`
- Убедись что backend доступен
- Проверь консоль браузера (F12 → Console)

---

## 💰 Рекомендуемый стек для экономии

```
Render backend    - БЕСПЛАТНО ✅
Render MongoDB    - БЕСПЛАТНО ✅
Vercel админка    - БЕСПЛАТНО ✅
─────────────────────────────
ИТОГО: 0$ ✅
```

**Или если Render не подходит:**
```
Railway backend   - БЕСПЛАТНО ✅
Railway MongoDB   - БЕСПЛАТНО ✅
Vercel админка    - БЕСПЛАТНО ✅
─────────────────────────────
ИТОГО: 0$ ✅
```

---

## 🎉 Готово!

Выбери вариант развертывания и начинай! Любые вопросы - пиши!
