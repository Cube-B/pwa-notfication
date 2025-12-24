# 🎬 1klive - Live Streaming Platform PWA

> Progressive Web Application สำหรับแพลตฟอร์มสตรีมมิ่งสด พร้อมระบบ Push Notifications และ Admin Dashboard แบบครบวงจร

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Vue.js Version](https://img.shields.io/badge/vue-3.3.4-brightgreen.svg)](https://vuejs.org/)

---

## 📋 สารบัญ

- [ภาพรวมโปรเจกต์](#-ภาพรวมโปรเจกต์)
- [คุณสมบัติหลัก](#-คุณสมบัติหลัก)
- [เทคโนโลยีที่ใช้](#️-เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [การติดตั้งและใช้งาน](#-การติดตั้งและใช้งาน)
- [การกำหนดค่า](#-การกำหนดค่า)
- [API Documentation](#-api-documentation)
- [PWA และ Push Notifications](#-pwa-และ-push-notifications)
- [Admin Dashboard](#-admin-dashboard)
- [การ Deploy](#-การ-deploy)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 ภาพรวมโปรเจกต์

**1klive** เป็น Full-Stack Progressive Web Application ที่ออกแบบมาเพื่อแพลตฟอร์มสตรีมมิ่งสด มาพร้อมกับ:

- 📱 PWA ที่ติดตั้งได้บนทั้ง iOS และ Android
- 🔔 ระบบ Push Notifications แบบ Real-time
- 👨‍💼 Admin Dashboard สำหรับจัดการระบบ
- 🚀 Performance สูง และ Offline Support
- 🎨 UI/UX สวยงาม ทันสมัย ใช้งานง่าย

### วัตถุประสงค์

โปรเจกต์นี้ถูกสร้างขึ้นเพื่อ:
1. ให้ผู้ใช้สามารถติดตั้ง App บนมือถือได้โดยไม่ต้องผ่าน App Store
2. ส่งการแจ้งเตือนเมื่อมีไลฟ์สดใหม่แบบ Real-time
3. จัดการ Subscribers และ Notifications ผ่าน Admin Dashboard
4. ให้บริการได้แม้ไม่มีอินเทอร์เน็ต (Offline Mode)

---

## ✨ คุณสมบัติหลัก

### 🎯 User Features (Frontend)

- **Progressive Web App (PWA)**
  - ✅ ติดตั้งได้บนหน้าจอหลักของมือถือ
  - ✅ ทำงานแบบ Native App
  - ✅ Auto-update เมื่อมีเวอร์ชันใหม่
  - ✅ รองรับทั้ง iOS และ Android

- **Push Notifications**
  - ✅ Auto-subscribe หลังติดตั้ง PWA
  - ✅ รับการแจ้งเตือนแบบ Real-time
  - ✅ แจ้งเตือนแม้ปิด App
  - ✅ Click notification เพื่อเปิด App ได้ทันที

- **User Experience**
  - ✅ Loading screens สวยงาม
  - ✅ Permission management ที่ชัดเจน
  - ✅ Error handling ที่เป็นมิตร
  - ✅ Responsive design ทุกขนาดหน้าจอ

- **Offline Support**
  - ✅ Cache assets สำคัญ
  - ✅ ใช้งานบางส่วนได้แม้ไม่มีเน็ต
  - ✅ Background sync เมื่อกลับมา online

### 👨‍💼 Admin Features (Admin Dashboard)

- **Dashboard Analytics**
  - ✅ สถิติ Subscribers แบบ Real-time
  - ✅ กราฟแสดงการเติบโต
  - ✅ ข้อมูล Notifications ที่ส่งไป
  - ✅ Success/Failure rates

- **Notification Management**
  - ✅ ส่ง notifications ถึง All subscribers
  - ✅ กำหนด Title, Body, และ URL ได้
  - ✅ Preview ก่อนส่ง
  - ✅ ดูประวัติการส่ง

- **Subscriber Management**
  - ✅ ดูรายชื่อ Subscribers ทั้งหมด
  - ✅ แสดงสถานะ Active/Inactive
  - ✅ ดูข้อมูล subscription details
  - ✅ ลบ subscribers ที่ไม่ active

- **Admin Management**
  - ✅ Authentication system
  - ✅ จัดการบัญชี Admin
  - ✅ Role-based access control
  - ✅ ล็อกอิน/ล็อกเอาท์ที่ปลอดภัย

- **Settings**
  - ✅ แก้ไข PWA config
  - ✅ ตั้งค่า Notification templates
  - ✅ จัดการ VAPID keys
  - ✅ Database maintenance

### 🔒 Backend Features

- **RESTful API**
  - ✅ Endpoints ครบถ้วนสำหรับทุกฟีเจอร์
  - ✅ API Documentation ที่ชัดเจน
  - ✅ Input validation
  - ✅ Error handling

- **Database Management**
  - ✅ PostgreSQL พร้อม connection pooling
  - ✅ Auto-migration schemas
  - ✅ Transaction support
  - ✅ Data integrity

- **Security**
  - ✅ HTTPS enforcement
  - ✅ CORS configuration
  - ✅ Rate limiting
  - ✅ Helmet.js security headers
  - ✅ Environment variables protection
  - ✅ SQL injection prevention

- **Performance**
  - ✅ Response compression
  - ✅ Efficient database queries
  - ✅ Caching strategies
  - ✅ Optimized asset delivery

---

## 🛠️ เทคโนโลยีที่ใช้

### Frontend (User Interface)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue.js** | 3.3.4 | Progressive JavaScript Framework |
| **Vite** | 4.4.11 | Build Tool & Dev Server (HMR) |
| **Service Worker** | - | PWA Features & Offline Support |
| **Web Push API** | - | Browser Push Notifications |
| **CSS3** | - | Modern Styling & Animations |

### Admin Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue.js** | 3.4.21 | Progressive JavaScript Framework |
| **Vite** | 5.4.21 | Build Tool & Dev Server |
| **Vue Router** | - | Client-side Routing |
| **Axios** | - | HTTP Client |

### Backend (API Server)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript Runtime |
| **Express.js** | 4.18.2 | Web Framework |
| **PostgreSQL** | 14+ | Relational Database |
| **web-push** | 3.6.6 | Web Push Protocol Library |
| **bcrypt** | 5.1.1 | Password Hashing |
| **jsonwebtoken** | 9.0.2 | JWT Authentication |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **Helmet** | 7.1.0 | Security Headers |
| **compression** | 1.7.4 | Response Compression |
| **express-rate-limit** | 7.1.5 | API Rate Limiting |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ngrok** | HTTPS Tunneling for Mobile Testing |
| **pg** | PostgreSQL Client for Node.js |
| **dotenv** | Environment Variables Management |
| **nodemon** | Auto-restart Development Server |

---

## 📁 โครงสร้างโปรเจกต์

```
1klive-fullstack/
│
├── 📄 README.md                    # คู่มือหลัก (ไฟล์นี้)
├── 📄 QUICK_START.md               # เริ่มต้นอย่างรวดเร็ว
├── 📄 INSTRUCTIONS.md              # คำแนะนำแบบละเอียด
├── 📄 CHANGELOG.md                 # บันทึกการเปลี่ยนแปลง
├── 📄 PROJECT_SUMMARY.md           # สรุปโปรเจกต์
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 frontend/                    # Vue.js User Frontend
│   │
│   ├── 📁 src/
│   │   ├── 📄 App.vue              # Main component with PWA logic
│   │   ├── 📄 main.js              # Entry point + SW registration
│   │   └── 📄 style.css            # Global styles (Streaming theme)
│   │
│   ├── 📁 public/
│   │   ├── 📄 manifest.json        # PWA manifest configuration
│   │   ├── 📄 sw.js                # Service Worker script
│   │   ├── 📄 logo.png             # App logo (512x512)
│   │   └── 📄 logo.png.txt         # Logo instructions
│   │
│   ├── 📄 index.html               # HTML entry point
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📄 package-lock.json        # Locked versions
│   ├── 📄 vite.config.js           # Vite configuration
│   └── 📄 SETUP_INSTRUCTIONS.txt   # Setup guide
│
├── 📁 admin-frontend/              # Vue.js Admin Dashboard
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable components
│   │   │   ├── 📄 DashboardStats.vue
│   │   │   ├── 📄 NotificationForm.vue
│   │   │   ├── 📄 SubscriberList.vue
│   │   │   └── 📄 AdminList.vue
│   │   │
│   │   ├── 📁 views/               # Page components
│   │   │   ├── 📄 Dashboard.vue
│   │   │   ├── 📄 Login.vue
│   │   │   ├── 📄 Notifications.vue
│   │   │   ├── 📄 Subscribers.vue
│   │   │   ├── 📄 Admins.vue
│   │   │   └── 📄 Settings.vue
│   │   │
│   │   ├── 📁 router/              # Vue Router config
│   │   │   └── 📄 index.js
│   │   │
│   │   ├── 📄 App.vue              # Root component
│   │   ├── 📄 main.js              # Entry point
│   │   └── 📄 style.css            # Global admin styles
│   │
│   ├── 📄 index.html               # HTML entry point
│   ├── 📄 package.json             # Admin dependencies
│   └── 📄 vite.config.js           # Vite configuration
│
└── 📁 backend/                     # Node.js Express API
    │
    ├── 📁 routes/                  # API Route handlers
    │   ├── 📄 auth.js              # Authentication routes
    │   ├── 📄 dashboard.js         # Dashboard stats routes
    │   ├── 📄 notifications.js     # Notification management
    │   ├── 📄 subscriptions.js     # Subscription management
    │   ├── 📄 admins.js            # Admin management
    │   ├── 📄 settings.js          # Settings routes
    │   └── 📄 pwa.js               # PWA configuration routes
    │
    ├── 📁 middleware/              # Custom middleware
    │   └── 📄 auth.js              # JWT authentication middleware
    │
    ├── 📄 server.js                # Express server + API endpoints
    ├── 📄 package.json             # Backend dependencies
    ├── 📄 package-lock.json        # Locked versions
    ├── 📄 .env                     # Environment variables (private)
    ├── 📄 .env.example             # Environment template
    ├── 📄 generate-vapid-keys.js   # VAPID key generator script
    └── 📄 test-api.sh              # API testing bash script
```

### คำอธิบายโครงสร้างหลัก

#### 📁 frontend/
Interface สำหรับผู้ใช้ทั่วไป:
- รับการแจ้งเตือน
- ติดตั้ง PWA
- เข้าชมไลฟ์สด

#### 📁 admin-frontend/
Dashboard สำหรับผู้ดูแลระบบ:
- ส่ง notifications
- ดูสถิติ
- จัดการ subscribers
- ตั้งค่าระบบ

#### 📁 backend/
API Server และ Database:
- จัดการ subscriptions
- ส่ง push notifications
- Authentication
- Data persistence

---

## 🚀 การติดตั้งและใช้งาน

### ✅ ความต้องการของระบบ (Prerequisites)

ก่อนเริ่มต้น ต้องติดตั้งสิ่งเหล่านี้ก่อน:

- **Node.js** v18 หรือสูงกว่า (แนะนำ v20 หรือ v22)
  ```bash
  node --version  # ตรวจสอบเวอร์ชัน
  ```

- **PostgreSQL** v14 หรือสูงกว่า
  ```bash
  psql --version  # ตรวจสอบเวอร์ชัน
  ```

- **npm** หรือ **yarn** (มากับ Node.js)
  ```bash
  npm --version   # ตรวจสอบเวอร์ชัน
  ```

- **(Optional) ngrok** สำหรับทดสอบบนมือถือ
  - Download: https://ngrok.com/download

### 📥 ขั้นตอนที่ 1: Clone Repository

```bash
# Clone project
git clone https://github.com/yourusername/1klive-fullstack.git

# เข้าไปใน directory
cd 1klive-fullstack
```

### 🗄️ ขั้นตอนที่ 2: Setup Database

#### 2.1 สร้าง Database

```bash
# เปิด PostgreSQL
psql -U postgres

# สร้าง database
CREATE DATABASE 1klive_db;

# ออกจาก psql
\q
```

#### 2.2 ตารางจะถูกสร้างอัตโนมัติ

เมื่อ Backend server start ครั้งแรก ตารางเหล่านี้จะถูกสร้างอัตโนมัติ:

- `subscriptions` - เก็บข้อมูล push notification subscribers
- `admins` - เก็บข้อมูล admin accounts
- `notifications` - เก็บประวัติการส่ง notifications
- `settings` - เก็บการตั้งค่าระบบ

### 🔧 ขั้นตอนที่ 3: Setup Backend

#### 3.1 เข้าไปใน Backend Directory

```bash
cd backend
```

#### 3.2 ติดตั้ง Dependencies

```bash
npm install
```

#### 3.3 Generate VAPID Keys

```bash
node generate-vapid-keys.js
```

คุณจะได้ output แบบนี้:
```
=======================================
VAPID Keys Generated
=======================================

Public Key:
BJAx...XXXX

Private Key:
abcd...YYYY

=======================================
Copy these to your .env file
=======================================
```

#### 3.4 สร้างไฟล์ .env

```bash
cp .env.example .env
```

#### 3.5 แก้ไข .env ไฟล์

เปิดไฟล์ `.env` และแก้ไข:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=1klive_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# VAPID Keys (paste จาก step 3.3)
VAPID_PUBLIC_KEY=BJAx...XXXX
VAPID_PRIVATE_KEY=abcd...YYYY
VAPID_EMAIL=mailto:admin@1klive.com

# JWT Secret (สุ่ม string ยาวๆ)
JWT_SECRET=your_very_long_secret_key_here_minimum_32_characters

# Frontend URLs (สำหรับ CORS)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

#### 3.6 Start Backend Server

```bash
npm start
```

หรือสำหรับ development (auto-reload):
```bash
npm run dev
```

คุณควรเห็น:
```
🎉 ====================================
🎉  1klive Backend Server
🎉 ====================================

📡 Server running on: http://localhost:3000
🌐 Network access: http://0.0.0.0:3000

📋 Available endpoints:
  GET  /api/health
  GET  /api/notifications/vapid
  POST /api/notifications/subscribe
  POST /api/notifications/send
  ...

✅ Database connected successfully
✅ All systems ready!
```

#### 3.7 ทดสอบ Backend

```bash
# เปิด terminal ใหม่
curl http://localhost:3000/api/health

# ควรได้ response:
# {"status":"OK","service":"1klive","timestamp":"2024-12-24T...","database":"connected"}
```

หรือใช้ script ทดสอบที่มีให้:
```bash
chmod +x test-api.sh
./test-api.sh
```

### 🎨 ขั้นตอนที่ 4: Setup Frontend (User)

#### 4.1 เข้าไปใน Frontend Directory

```bash
# จาก root directory
cd frontend
```

#### 4.2 ติดตั้ง Dependencies

```bash
npm install
```

#### 4.3 หา Local IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

คุณจะได้ IP address เช่น:
- `192.168.1.XXX` (Wi-Fi ทั่วไป)
- `10.0.0.XXX` (บาง network)
- `172.16.0.XXX` (corporate network)

#### 4.4 แก้ไข Backend URL

แก้ไขไฟล์ `src/App.vue`:

```javascript
// หาบรรทัดนี้ (ประมาณบรรทัด 203-205)
const TARGET_URL = 'https://1klive.com/'
const BACKEND_URL = 'http://localhost:3000'

// แก้เป็น:
const TARGET_URL = 'https://your-live-site.com/'  // URL ปลายทาง
const BACKEND_URL = 'http://192.168.1.XXX:3000'   // ใส่ IP ของคุณ
```

💡 **Tips:**
- ถ้าทดสอบบน desktop เดียวกัน → ใช้ `localhost`
- ถ้าทดสอบบนมือถือใน network เดียวกัน → ใช้ IP address

#### 4.5 Start Frontend Server

```bash
npm run dev
```

คุณจะเห็น:
```
  VITE v4.4.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.XXX:5173/
  ➜  press h to show help
```

#### 4.6 เปิดเบราว์เซอร์

เปิด Chrome หรือ Edge:
```
http://localhost:5173
```

### 👨‍💼 ขั้นตอนที่ 5: Setup Admin Frontend

#### 5.1 เข้าไปใน Admin Frontend Directory

```bash
# จาก root directory
cd admin-frontend
```

#### 5.2 ติดตั้ง Dependencies

```bash
npm install
```

#### 5.3 แก้ไข API URL (ถ้าจำเป็น)

ตรวจสอบไฟล์ที่มีการเรียก API และแก้ไข URL:

```javascript
// ในไฟล์ที่เรียก API (เช่น src/views/*.vue)
const API_URL = 'http://localhost:3000/api'
// หรือ
const API_URL = 'http://192.168.1.XXX:3000/api'
```

#### 5.4 Start Admin Frontend Server

```bash
npm run dev
```

คุณจะเห็น:
```
  VITE v5.4.21  ready in 300 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: http://192.168.1.XXX:5174/
```

#### 5.5 เข้าสู่ระบบ Admin

1. เปิดเบราว์เซอร์: `http://localhost:5174`
2. ใช้ default admin credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. **⚠️ สำคัญ:** เปลี่ยนรหัสผ่านทันทีหลังล็อกอินครั้งแรก!

---

## ⚙️ การกำหนดค่า

### Frontend Configuration

#### manifest.json (PWA Settings)

แก้ไขไฟล์ `frontend/public/manifest.json`:

```json
{
  "name": "1klive - Live Streaming",
  "short_name": "1klive",
  "description": "แพลตฟอร์มสตรีมมิ่งสดระดับโลก",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F0F1E",
  "theme_color": "#FF0050",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### App.vue (URLs and Behavior)

```javascript
// Configuration constants
const TARGET_URL = 'https://1klive.com/'       // URL ที่เปิดหลังติดตั้ง PWA
const BACKEND_URL = 'http://localhost:3000'    // Backend API URL
const AUTO_REDIRECT_DELAY = 3000               // Delay ก่อน redirect (ms)
```

#### style.css (Colors and Theme)

```css
:root {
  /* Color Palette */
  --primary: #FF0050;      /* Vibrant Pink/Red */
  --secondary: #6C5CE7;    /* Purple */
  --accent: #00D9FF;       /* Cyan */
  --background: #0F0F1E;   /* Dark Blue */
  --text-primary: #FFFFFF; /* White */
  --text-secondary: #B8B8B8; /* Gray */
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, var(--primary), var(--secondary));
  --gradient-accent: linear-gradient(135deg, var(--accent), var(--secondary));
  
  /* Spacing */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

### Backend Configuration

#### .env (Environment Variables)

```env
# =================================
# Server Configuration
# =================================
PORT=3000
NODE_ENV=development

# =================================
# Database Configuration
# =================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=1klive_db
DB_USER=postgres
DB_PASSWORD=your_password

# =================================
# VAPID Configuration
# =================================
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:admin@1klive.com

# =================================
# JWT Configuration
# =================================
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

# =================================
# Frontend URLs (for CORS)
# =================================
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# =================================
# Rate Limiting
# =================================
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# =================================
# Notification Settings
# =================================
NOTIFICATION_ICON=/logo.png
NOTIFICATION_BADGE=/logo.png
```

#### server.js (CORS and Security)

```javascript
// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',           // Frontend dev
  'http://localhost:5174',           // Admin dev
  'http://192.168.1.0/24:5173',      // Local network
  'https://your-domain.com',         // Production
  /^https:\/\/[\w-]+\.ngrok-free\.app$/ // ngrok
];

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  message: 'Too many requests, please try again later'
});
```

### Database Configuration

#### PostgreSQL Settings

```sql
-- แก้ไขไฟล์ postgresql.conf (ถ้าจำเป็น)

-- Connection Settings
max_connections = 100
shared_buffers = 128MB

-- Performance Settings
effective_cache_size = 4GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1

-- Logging
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Admin endpoints ต้องการ JWT Token ใน Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### 🔓 Public Endpoints

#### 1. Health Check

ตรวจสอบสถานะ server และ database

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "OK",
  "service": "1klive",
  "timestamp": "2024-12-24T10:30:00.000Z",
  "database": "connected",
  "uptime": 12345
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

#### 2. Get VAPID Public Key

ดึง VAPID public key สำหรับ subscribe push notifications

**Endpoint:** `GET /api/notifications/vapid`

**Response:**
```json
{
  "publicKey": "BJAx...XXXX"
}
```

**Example:**
```bash
curl http://localhost:3000/api/notifications/vapid
```

---

#### 3. Subscribe to Notifications

Subscribe เพื่อรับ push notifications

**Endpoint:** `POST /api/notifications/subscribe`

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BEJ...XXX",
      "auth": "abc...YYY"
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Subscription saved and welcome notification sent",
  "subscriptionId": 123
}
```

**Response (Already Exists):**
```json
{
  "success": true,
  "message": "Subscription already exists",
  "subscriptionId": 123
}
```

**Example:**
```javascript
// ใน Service Worker
self.addEventListener('push', async event => {
  const subscription = await self.registration.pushManager.getSubscription();
  
  await fetch('http://localhost:3000/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription })
  });
});
```

---

#### 4. Unsubscribe from Notifications

Unsubscribe จากการรับ notifications

**Endpoint:** `POST /api/notifications/unsubscribe`

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unsubscribed successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/notifications/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "https://fcm.googleapis.com/..."}'
```

---

#### 5. Get PWA Configuration

ดึงค่า config สำหรับ PWA (manifest, icons, etc.)

**Endpoint:** `GET /api/pwa/config`

**Response:**
```json
{
  "name": "1klive",
  "shortName": "1klive",
  "description": "Live Streaming Platform",
  "themeColor": "#FF0050",
  "backgroundColor": "#0F0F1E",
  "startUrl": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

### 🔐 Admin Endpoints

#### 6. Admin Login

ล็อกอินเพื่อเข้าใช้ Admin Dashboard

**Endpoint:** `POST /api/admin/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "super_admin",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

#### 7. Get Dashboard Stats

ดึงสถิติต่างๆ สำหรับแสดงใน Dashboard

**Endpoint:** `GET /api/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSubscribers": 150,
    "activeSubscribers": 145,
    "inactiveSubscribers": 5,
    "totalNotificationsSent": 1250,
    "successRate": 98.5,
    "todaySubscribers": 12,
    "weekGrowth": 23,
    "monthGrowth": 87
  },
  "recentActivity": [
    {
      "type": "subscription",
      "message": "New subscriber from Chrome on Android",
      "timestamp": "2024-12-24T10:30:00.000Z"
    },
    {
      "type": "notification",
      "message": "Sent notification to 145 subscribers",
      "timestamp": "2024-12-24T10:25:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 8. Send Notification to All

ส่ง notification ไปยัง subscribers ทั้งหมด

**Endpoint:** `POST /api/admin/notifications/send`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "🎬 มีไลฟ์สดใหม่!",
  "body": "รายการพิเศษกำลังจะเริ่มใน 5 นาที!",
  "url": "https://1klive.com/live/12345",
  "icon": "/logo.png",
  "badge": "/logo.png"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 145,
  "failed": 5,
  "total": 150,
  "details": {
    "successRate": 96.67,
    "errors": [
      "Subscription expired: endpoint_1",
      "Invalid subscription: endpoint_2"
    ]
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎬 มีไลฟ์สดใหม่!",
    "body": "รายการพิเศษเริ่มแล้ว",
    "url": "https://1klive.com/live/123"
  }'
```

---

#### 9. Get All Subscribers

ดูรายชื่อ subscribers ทั้งหมด

**Endpoint:** `GET /api/admin/subscriptions/list`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 50)
- `status` (optional): `active` หรือ `inactive`

**Response:**
```json
{
  "success": true,
  "subscribers": [
    {
      "id": 1,
      "endpoint": "https://fcm.googleapis.com/...",
      "browser": "Chrome",
      "platform": "Android",
      "createdAt": "2024-12-24T10:00:00.000Z",
      "lastNotification": "2024-12-24T10:30:00.000Z",
      "active": true
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 3,
    "limit": 50
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/admin/subscriptions/list?page=1&limit=50&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 10. Delete Subscriber

ลบ subscriber ออกจากระบบ

**Endpoint:** `DELETE /api/admin/subscriptions/:id`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscriber deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/admin/subscriptions/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 11. Get All Admins

ดูรายชื่อ admin accounts ทั้งหมด

**Endpoint:** `GET /api/admin/admins/list`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "admins": [
    {
      "id": 1,
      "username": "admin",
      "role": "super_admin",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "lastLogin": "2024-12-24T10:00:00.000Z"
    },
    {
      "id": 2,
      "username": "moderator",
      "role": "admin",
      "createdAt": "2024-12-15T00:00:00.000Z",
      "lastLogin": "2024-12-24T09:30:00.000Z"
    }
  ]
}
```

---

#### 12. Create New Admin

สร้าง admin account ใหม่

**Endpoint:** `POST /api/admin/admins/create`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "new_admin",
  "password": "secure_password_123",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "id": 3,
    "username": "new_admin",
    "role": "admin",
    "createdAt": "2024-12-24T10:40:00.000Z"
  }
}
```

---

#### 13. Update Admin Password

เปลี่ยนรหัสผ่าน admin

**Endpoint:** `PUT /api/admin/admins/password`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### 14. Get Settings

ดึงค่าตั้งค่าระบบ

**Endpoint:** `GET /api/admin/settings`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "pwa": {
      "name": "1klive",
      "shortName": "1klive",
      "description": "Live Streaming Platform",
      "themeColor": "#FF0050",
      "backgroundColor": "#0F0F1E"
    },
    "notifications": {
      "defaultTitle": "1klive",
      "defaultIcon": "/logo.png",
      "defaultBadge": "/logo.png",
      "autoSubscribe": true
    },
    "system": {
      "maintenanceMode": false,
      "maxSubscribers": 10000
    }
  }
}
```

---

#### 15. Update Settings

อัพเดทการตั้งค่าระบบ

**Endpoint:** `PUT /api/admin/settings`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pwa": {
    "themeColor": "#FF0050"
  },
  "notifications": {
    "autoSubscribe": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

### Error Responses

ทุก endpoint จะส่ง error ในรูปแบบเดียวกัน:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (ข้อมูลไม่ถูกต้อง)
- `401` - Unauthorized (ไม่มี token หรือ token หมดอายุ)
- `403` - Forbidden (ไม่มีสิทธิ์เข้าถึง)
- `404` - Not Found (ไม่พบข้อมูล)
- `429` - Too Many Requests (ส่ง request มากเกินไป)
- `500` - Internal Server Error (error ภายใน server)

---

## 🔔 PWA และ Push Notifications

### การทำงานของ PWA

#### 1. Service Worker Registration

```javascript
// frontend/src/main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('✅ Service Worker registered:', registration)
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  })
}
```

#### 2. PWA Installation

```javascript
// Capture beforeinstallprompt event
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton() // แสดงปุ่มติดตั้ง
})

// Show install prompt when button clicked
async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response: ${outcome}`)
    deferredPrompt = null
  }
}
```

#### 3. Detect Installation Success

```javascript
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully')
  // Auto-subscribe to notifications
  subscribeToPushNotifications()
})
```

### การทำงานของ Push Notifications

#### 1. Request Permission

```javascript
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  
  if (permission === 'granted') {
    console.log('✅ Notification permission granted')
    return true
  } else if (permission === 'denied') {
    console.log('❌ Notification permission denied')
    return false
  } else {
    console.log('⚠️ Notification permission dismissed')
    return false
  }
}
```

#### 2. Get VAPID Public Key

```javascript
const response = await fetch(`${BACKEND_URL}/api/notifications/vapid`)
const { publicKey } = await response.json()
```

#### 3. Subscribe to Push Manager

```javascript
async function subscribeToPush(publicKey) {
  const registration = await navigator.serviceWorker.ready
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  })
  
  return subscription
}
```

#### 4. Send Subscription to Backend

```javascript
await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ subscription })
})
```

#### 5. Handle Push Events in Service Worker

```javascript
// frontend/public/sw.js
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    data: {
      url: data.url || '/'
    },
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'เปิดดู'
      },
      {
        action: 'close',
        title: 'ปิด'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || '1klive', options)
  )
})
```

#### 6. Handle Notification Clicks

```javascript
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          // ถ้ามี window เปิดอยู่แล้ว ให้ focus ที่ window นั้น
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          // ถ้าไม่มี window เปิด ให้เปิด window ใหม่
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})
```

### Offline Support

#### Caching Strategies

```javascript
// frontend/public/sw.js

const CACHE_NAME = '1klive-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
]

// Install: Cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response
        }
        // Clone request for fetch
        const fetchRequest = event.request.clone()
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // Clone response for cache
          const responseToCache = response.clone()
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })
          
          return response
        })
      })
  )
})

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
```

---

## 👨‍💼 Admin Dashboard

### Login System

#### Authentication Flow

1. Admin ใส่ username/password
2. Backend validate และ generate JWT token
3. Token ถูกเก็บใน localStorage
4. ทุก API request ส่ง token ใน Authorization header
5. Token หมดอายุใน 7 วัน (configurable)

#### Protected Routes

```javascript
// admin-frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/Notifications.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('adminToken')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
```

### Dashboard Features

#### 1. Stats Overview
- Total subscribers
- Active/Inactive subscribers
- Notifications sent today/week/month
- Success rate
- Growth charts

#### 2. Send Notifications
- Title, body, URL inputs
- Preview before send
- Send to all or specific groups
- Real-time sending progress

#### 3. Subscriber Management
- List all subscribers
- Filter by status (active/inactive)
- Search by endpoint
- Delete inactive subscribers
- View subscription details

#### 4. Admin Management
- Create new admin accounts
- Update passwords
- Delete admin accounts (super admin only)
- View admin activity logs

#### 5. Settings
- Update PWA configuration
- Notification templates
- VAPID keys management
- System maintenance mode

---

## 🚀 การ Deploy

### Frontend (User) Deployment

#### Option 1: Netlify (แนะนำ)

```bash
# 1. Build
cd frontend
npm run build

# 2. Deploy via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod

# หรือใช้ drag-and-drop ใน Netlify dashboard
# อัพโหลดโฟลเดอร์ dist/
```

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 2: Vercel

```bash
# 1. Build
npm run build

# 2. Deploy
npm install -g vercel
vercel --prod
```

#### Option 3: GitHub Pages

```bash
# 1. แก้ไข vite.config.js
export default {
  base: '/repo-name/'
}

# 2. Build
npm run build

# 3. Deploy
npm run deploy  # ถ้ามี script
```

### Admin Frontend Deployment

เหมือนกับ Frontend แต่:
- แก้ API_URL ให้ชี้ไปที่ Production backend
- อาจแยก domain หรือใช้ subdomain (เช่น admin.1klive.com)

### Backend Deployment

#### Option 1: Railway (แนะนำ)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Add PostgreSQL database
railway add postgresql

# 5. Set environment variables
railway variables set VAPID_PUBLIC_KEY=your_key
railway variables set VAPID_PRIVATE_KEY=your_key
railway variables set JWT_SECRET=your_secret
# ... ตั้งค่าอื่นๆ

# 6. Deploy
railway up
```

#### Option 2: Heroku

```bash
# 1. Create app
heroku create 1klive-backend

# 2. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Set environment variables
heroku config:set VAPID_PUBLIC_KEY=your_key
heroku config:set VAPID_PRIVATE_KEY=your_key
# ... ตั้งค่าอื่นๆ

# 4. Deploy
git push heroku main
```

#### Option 3: DigitalOcean / AWS / VPS

```bash
# 1. SSH เข้า server
ssh user@your-server-ip

# 2. Install Node.js และ PostgreSQL
# (ขั้นตอนขึ้นอยู่กับ OS)

# 3. Clone และ setup
git clone https://github.com/yourusername/1klive.git
cd 1klive/backend
npm install
npm install -g pm2

# 4. ตั้งค่า .env

# 5. Start with PM2
pm2 start server.js --name 1klive-backend
pm2 save
pm2 startup

# 6. Setup Nginx reverse proxy
# /etc/nginx/sites-available/1klive
server {
    listen 80;
    server_name api.1klive.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 7. Enable site และ restart Nginx
ln -s /etc/nginx/sites-available/1klive /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 8. Setup SSL with Let's Encrypt
certbot --nginx -d api.1klive.com
```

### Database Deployment

#### Railway PostgreSQL (แนะนำ)
- มีให้ฟรี 500MB
- Auto-backup
- Easy connection

#### Heroku Postgres
- มีให้ฟรี 10,000 rows
- Auto-backup
- Easy setup

#### Managed PostgreSQL
- AWS RDS
- DigitalOcean Managed Database
- Google Cloud SQL

### Production Checklist

#### Frontend
- [ ] Build production (`npm run build`)
- [ ] Test build locally
- [ ] Update BACKEND_URL to production
- [ ] Update TARGET_URL to production domain
- [ ] Enable HTTPS
- [ ] Test PWA installation
- [ ] Test push notifications
- [ ] Setup CDN (optional)
- [ ] Setup monitoring (Google Analytics, etc.)

#### Admin Frontend
- [ ] Build production
- [ ] Update API_URL to production
- [ ] Setup separate domain/subdomain
- [ ] Enable HTTPS
- [ ] Test all features
- [ ] Setup rate limiting
- [ ] Setup monitoring

#### Backend
- [ ] Set NODE_ENV=production
- [ ] Generate production VAPID keys
- [ ] Setup production database
- [ ] Update CORS allowed origins
- [ ] Enable HTTPS
- [ ] Setup process manager (PM2)
- [ ] Setup monitoring (Sentry, etc.)
- [ ] Setup logging
- [ ] Setup backup system
- [ ] Load testing
- [ ] Security audit

#### Database
- [ ] Create production database
- [ ] Setup connection pooling
- [ ] Setup automated backups
- [ ] Setup monitoring
- [ ] Optimize indexes
- [ ] Setup read replicas (if needed)

---

## 🔧 Troubleshooting

### ปัญหาที่พบบ่อยและวิธีแก้

#### 1. PWA ไม่แสดงปุ่มติดตั้ง

**สาเหตุ:**
- ไม่ได้ใช้ HTTPS (บนมือถือ)
- Service Worker ไม่ได้ register
- ติดตั้งไปแล้ว
- เบราว์เซอร์ไม่รองรับ

**วิธีแก้:**
```bash
# 1. ใช้ ngrok สำหรับ HTTPS
ngrok http 5173

# 2. ตรวจสอบ Service Worker
# เปิด DevTools → Application → Service Workers
# ควรเห็น sw.js (activated and is running)

# 3. ตรวจสอบ Console
# ต้องไม่มี error จาก Service Worker

# 4. ลองเปิดใน Incognito Mode
```

#### 2. Notifications ไม่ทำงาน

**สาเหตุ:**
- ไม่ได้ขอ permission
- VAPID keys ผิด
- Backend ไม่ได้รัน
- Subscription failed

**วิธีแก้:**
```javascript
// 1. ตรวจสอบ permission
console.log('Permission:', Notification.permission)
// ควรเป็น 'granted'

// 2. ตรวจสอบ VAPID keys
// เปรียบเทียบ public key ใน .env กับที่ได้จาก API

// 3. ตรวจสอบ subscription
const registration = await navigator.serviceWorker.ready
const subscription = await registration.pushManager.getSubscription()
console.log('Subscription:', subscription)
// ถ้าเป็น null แปลว่ายัง subscribe

// 4. ลอง subscribe ใหม่
```

#### 3. Backend ไม่เชื่อมต่อ Database

**สาเหตุ:**
- PostgreSQL ไม่ได้รัน
- Credentials ผิด
- Database ไม่มี

**วิธีแก้:**
```bash
# 1. ตรวจสอบว่า PostgreSQL รันอยู่
# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# 2. ทดสอบเชื่อมต่อ
psql -U postgres -d 1klive_db

# 3. ตรวจสอบ .env
# ให้แน่ใจว่า DB_USER, DB_PASSWORD ถูกต้อง

# 4. สร้าง database ใหม่ (ถ้ายังไม่มี)
createdb -U postgres 1klive_db
```

#### 4. CORS Errors

**สาเหตุ:**
- Frontend และ Backend อยู่คนละ domain
- CORS ไม่ได้ตั้งค่า

**วิธีแก้:**
```javascript
// แก้ไข backend/server.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://YOUR_IP:5173',
  'http://YOUR_IP:5174',
  'https://your-production-domain.com',
  // เพิ่ม origin ที่ต้องการ
]
```

#### 5. Build Production Failed

**สาเหตุ:**
- Dependencies ไม่ครบ
- Node version ไม่รองรับ
- Out of memory

**วิธีแก้:**
```bash
# 1. ลบและติดตั้ง dependencies ใหม่
rm -rf node_modules package-lock.json
npm install

# 2. ตรวจสอบ Node version
node --version
# ควรเป็น v18+ หรือสูงกว่า

# 3. เพิ่ม memory limit (ถ้า out of memory)
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

#### 6. JWT Token หมดอายุ

**สาเหตุ:**
- Token expire time สั้นเกินไป
- Server restart แล้ว token เก่าใช้ไม่ได้

**วิธีแก้:**
```javascript
// 1. ตั้งค่า expire time ใน .env
JWT_EXPIRES_IN=7d  // 7 วัน

// 2. Implement token refresh
// หรือให้ user login ใหม่เมื่อ token หมดอายุ

// 3. Handle 401 errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

#### 7. ngrok Connection Failed

**สาเหตุ:**
- ngrok ไม่ได้ติดตั้ง
- Port ผิด
- Firewall blocking

**วิธีแก้:**
```bash
# 1. ติดตั้ง ngrok
brew install ngrok  # macOS
# หรือดาวน์โหลดจาก ngrok.com

# 2. ตรวจสอบว่า Frontend รันที่ port ไหน
# ดูจาก terminal output ของ npm run dev

# 3. Run ngrok
ngrok http 5173

# 4. ใช้ HTTPS URL ที่ได้
# https://xxxxx.ngrok-free.app
```

---

## 💡 Best Practices

### Frontend Development

#### 1. Component Organization
```
src/
├── components/       # Reusable components
├── views/           # Page components
├── router/          # Router configuration
├── api/             # API calls
├── utils/           # Helper functions
└── assets/          # Static assets
```

#### 2. Error Handling
```javascript
async function fetchData() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch')
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    // Show user-friendly error message
    showErrorMessage('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
  }
}
```

#### 3. Loading States
```javascript
const state = reactive({
  isLoading: false,
  error: null,
  data: null
})

async function loadData() {
  state.isLoading = true
  state.error = null
  try {
    state.data = await fetchData()
  } catch (error) {
    state.error = error.message
  } finally {
    state.isLoading = false
  }
}
```

#### 4. Input Validation
```javascript
function validateNotification(data) {
  const errors = {}
  
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'กรุณาใส่หัวข้อ'
  }
  
  if (!data.body || data.body.trim().length === 0) {
    errors.body = 'กรุณาใส่เนื้อหา'
  }
  
  if (data.url && !isValidUrl(data.url)) {
    errors.url = 'URL ไม่ถูกต้อง'
  }
  
  return Object.keys(errors).length > 0 ? errors : null
}
```

### Backend Development

#### 1. Error Handling Middleware
```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err)
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

app.use(errorHandler)
```

#### 2. Input Validation
```javascript
function validateSubscription(req, res, next) {
  const { subscription } = req.body
  
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription data'
    })
  }
  
  next()
}

app.post('/api/notifications/subscribe', validateSubscription, async (req, res) => {
  // Handle subscription
})
```

#### 3. Database Connection Pooling
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,           // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

#### 4. Prepared Statements
```javascript
// ✅ Good - uses parameterized query
async function getSubscriber(endpoint) {
  const result = await pool.query(
    'SELECT * FROM subscriptions WHERE endpoint = $1',
    [endpoint]
  )
  return result.rows[0]
}

// ❌ Bad - vulnerable to SQL injection
async function getSubscriber(endpoint) {
  const result = await pool.query(
    `SELECT * FROM subscriptions WHERE endpoint = '${endpoint}'`
  )
  return result.rows[0]
}
```

### Security Best Practices

#### 1. Environment Variables
```bash
# ❌ Never commit .env to git
.env

# ✅ Use .env.example as template
.env.example
```

#### 2. Password Hashing
```javascript
const bcrypt = require('bcrypt')

// Hash password
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)
```

#### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

app.use('/api/', limiter)
```

#### 4. HTTPS Only in Production
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}
```

### Performance Optimization

#### 1. Lazy Loading
```javascript
// router/index.js
const routes = [
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue')
  }
]
```

#### 2. Image Optimization
```bash
# ใช้ WebP format
# ลดขนาดภาพก่อนใช้งาน
# ใช้ responsive images
```

#### 3. Database Indexing
```sql
-- สร้าง index สำหรับ column ที่ query บ่อย
CREATE INDEX idx_subscriptions_endpoint ON subscriptions(endpoint);
CREATE INDEX idx_subscriptions_active ON subscriptions(active);
```

#### 4. Caching
```javascript
// Cache API responses
const cache = new Map()

async function getCachedData(key, fetchFn, ttl = 300000) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key)
    if (Date.now() - timestamp < ttl) {
      return data
    }
  }
  
  const data = await fetchFn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

---

## 👥 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- ใช้ ES6+ syntax
- Follow Vue.js style guide
- Write descriptive commit messages
- Add comments สำหรับ logic ที่ซับซ้อน
- Test ก่อน submit PR

### Bug Reports

เมื่อรายงาน bug กรุณาระบุ:
- ขั้นตอนในการทำให้เกิด bug
- Expected behavior vs Actual behavior
- Screenshots (ถ้ามี)
- Environment (OS, Browser, Node version)
- Error messages / Stack traces

---

## 📄 License

MIT License

Copyright (c) 2024 1klive

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 Support & Contact

### 📚 Documentation
- [Quick Start Guide](./QUICK_START.md)
- [Detailed Instructions](./INSTRUCTIONS.md)
- [Change Log](./CHANGELOG.md)
- [Project Summary](./PROJECT_SUMMARY.md)

### 🔗 Links
- **Website:** https://1klive.com
- **GitHub:** https://github.com/yourusername/1klive
- **Issues:** https://github.com/yourusername/1klive/issues

### 💬 Community
- Discord: [Join our server](#)
- Telegram: [Join our group](#)
- Email: support@1klive.com

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Express.js community
- Web Push Protocol contributors
- All open source libraries used in this project

---

<div align="center">

**1klive v1.0.0**

Made with ❤️ for the streaming community

⭐ Star us on GitHub if this project helped you!

---

**Last Updated:** December 24, 2024

</div>
