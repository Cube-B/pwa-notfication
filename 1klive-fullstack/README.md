# 🎬 1klive - Live Streaming Platform PWA

แพลตฟอร์มสตรีมมิ่งสดระดับโลก พร้อมระบบ Push Notifications แบบ Real-time

## ✨ Features

- 📱 **Progressive Web App (PWA)** - ติดตั้งได้บนทั้ง iOS และ Android
- 🔔 **Push Notifications** - รับการแจ้งเตือนทันทีเมื่อมีไลฟ์สดใหม่
- ⚡ **Auto-Subscribe** - Subscribe notification อัตโนมัติหลังติดตั้ง
- 🎨 **Modern UI/UX** - ดีไซน์สวยงาม เรียบง่าย ใช้งานง่าย
- 🌐 **Offline Support** - ใช้งานได้แม้ไม่มีอินเทอร์เน็ต (บางส่วน)
- 🚀 **Fast & Lightweight** - โหลดเร็ว ประหยัด Data

## 🏗️ Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript Framework
- **Vite 4.x** - Next Generation Frontend Tooling
- **Service Worker** - PWA & Offline Support
- **Web Push API** - Push Notifications

### Backend
- **Node.js** - JavaScript Runtime
- **Express.js** - Web Framework
- **PostgreSQL** - Relational Database
- **web-push** - Web Push Protocol Library

## 📁 Project Structure

```
1klive-fullstack/
├── frontend/                 # Vue.js Frontend
│   ├── src/
│   │   ├── App.vue          # Main component
│   │   ├── main.js          # Entry point
│   │   └── style.css        # Global styles
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   ├── sw.js            # Service Worker
│   │   └── logo.png         # App logo
│   ├── index.html           # HTML entry
│   ├── package.json
│   └── vite.config.js       # Vite configuration
│
└── backend/                  # Node.js Backend
    ├── server.js            # Express server
    ├── package.json
    └── .env                 # Environment variables
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ (แนะนำ v20 หรือ v22)
- PostgreSQL 14+
- npm หรือ yarn

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/1klive.git
cd 1klive-fullstack
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate VAPID keys
npx web-push generate-vapid-keys

# Copy .env.example to .env
cp .env.example .env

# แก้ไข .env ให้ถูกต้อง:
# - ใส่ VAPID keys ที่ generate ได้
# - ตั้งค่า Database credentials
# - แก้ VAPID_EMAIL เป็นอีเมลของคุณ

# Start server
npm run dev
```

Backend จะรันที่: `http://localhost:3000`

### 3. Setup Database

```sql
-- เปิด PostgreSQL และสร้าง database
CREATE DATABASE 1klive_db;

-- ตารางจะถูกสร้างอัตโนมัติเมื่อ server start
```

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# แก้ไข src/App.vue
# เปลี่ยน BACKEND_URL ให้ตรงกับ Backend server ของคุณ:
const BACKEND_URL = 'http://YOUR_IP:3000'

# Start development server
npm run dev
```

Frontend จะรันที่: `http://localhost:5173`

### 5. Test on Mobile (ผ่าน ngrok)

```bash
# Install ngrok (ถ้ายังไม่มี)
# Download from https://ngrok.com/

# เปิด tunnel สำหรับ Frontend
ngrok http 5173

# คุณจะได้ HTTPS URL เช่น: https://abc123.ngrok-free.app
# เปิด URL นี้บนมือถือเพื่อทดสอบ
```

## 🔧 Configuration

### Frontend Configuration

แก้ไขไฟล์ `frontend/src/App.vue`:

```javascript
const TARGET_URL = 'https://1klive.com/'  // URL ปลายทางหลังติดตั้ง PWA
const BACKEND_URL = 'http://YOUR_IP:3000' // Backend API URL
```

### Backend Configuration

แก้ไขไฟล์ `backend/.env`:

```env
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=1klive_db
DB_USER=postgres
DB_PASSWORD=your_password

# VAPID Keys (generate ด้วย: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:admin@1klive.com

NODE_ENV=development
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
Response: { status: "OK", service: "1klive", ... }
```

### Get VAPID Public Key
```
GET /api/notifications/vapid
Response: { publicKey: "..." }
```

### Subscribe to Notifications
```
POST /api/notifications/subscribe
Body: { subscription: { endpoint, keys: { p256dh, auth } } }
Response: { success: true, message: "..." }
```

### Send Notification to All
```
POST /api/notifications/send
Body: { title: "...", body: "...", url: "..." }
Response: { success: true, sent: 10, failed: 0, total: 10 }
```

### Get Subscription Stats
```
GET /api/notifications/stats
Response: { stats: { total: 100, active: 95, ... } }
```

### Unsubscribe
```
POST /api/notifications/unsubscribe
Body: { endpoint: "..." }
Response: { success: true }
```

## 🔔 Testing Push Notifications

### 1. ติดตั้ง PWA บนมือถือ
- เปิด URL ผ่าน HTTPS (ngrok)
- กดปุ่ม "ติดตั้ง 1klive"
- อนุญาตการแจ้งเตือน

### 2. ส่ง Notification ทดสอบผ่าน API

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎬 มีไลฟ์สดใหม่!",
    "body": "รายการพิเศษเริ่มแล้ว เข้าชมเลย!",
    "url": "https://1klive.com/live/123"
  }'
```

### 3. ตรวจสอบ Stats

```bash
curl http://localhost:3000/api/notifications/stats
```

## 🎨 Customization

### เปลี่ยนสีธีม

แก้ไขไฟล์ `frontend/src/style.css`:

```css
:root {
  --primary: #FF0050;      /* สีหลัก */
  --secondary: #6C5CE7;    /* สีรอง */
  --accent: #00D9FF;       /* สีเน้น */
  /* ... */
}
```

### เปลี่ยน Logo

1. เตรียมไฟล์ logo (PNG, 512x512px)
2. แทนที่ไฟล์ `frontend/public/logo.png`
3. Build ใหม่: `npm run build`

### เปลี่ยน App Name

แก้ไขไฟล์ `frontend/public/manifest.json`:

```json
{
  "name": "ชื่อแอปของคุณ",
  "short_name": "ชื่อสั้น",
  ...
}
```

## 📦 Build for Production

### Build Frontend

```bash
cd frontend
npm run build

# ไฟล์จะถูกสร้างใน frontend/dist/
# อัปโหลด folder dist/ ไปยัง hosting ของคุณ
```

### Deploy Backend

```bash
cd backend

# Set production environment
export NODE_ENV=production

# Start with PM2 (แนะนำ)
npm install -g pm2
pm2 start server.js --name "1klive-backend"
pm2 save
pm2 startup
```

## 🔒 Security Considerations

- ใช้ HTTPS สำหรับ production (จำเป็นสำหรับ PWA)
- เก็บ `.env` ไว้เป็นความลับ (อย่า commit)
- ตั้งค่า CORS อย่างเหมาะสม
- ใช้ Rate Limiting สำหรับ API
- Validate input ทุกครั้ง
- Update dependencies เป็นประจำ

## 🐛 Troubleshooting

### PWA ไม่แสดงปุ่มติดตั้ง
- ตรวจสอบว่าใช้ HTTPS
- ตรวจสอบ manifest.json และ Service Worker
- เปิด Chrome DevTools → Application → Manifest

### Notification ไม่ทำงาน
- ตรวจสอบว่าอนุญาตการแจ้งเตือนแล้ว
- ตรวจสอบ VAPID keys ถูกต้อง
- ดู Console logs สำหรับ errors

### Database Connection Error
- ตรวจสอบ PostgreSQL รันอยู่
- ตรวจสอบ credentials ใน `.env`
- ตรวจสอบ firewall settings

### CORS Error
- ตรวจสอบ BACKEND_URL ใน frontend
- ตรวจสอบ CORS configuration ใน backend

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

## 🤝 Contributing

ยินดีรับ Pull Requests! กรุณา:
1. Fork repository
2. สร้าง feature branch
3. Commit changes
4. Push ไปยัง branch
5. เปิด Pull Request

## 📞 Support

- 📧 Email: support@1klive.com
- 🌐 Website: https://1klive.com
- 📱 Facebook: @1klive

---

Made with ❤️ for 1klive Community
