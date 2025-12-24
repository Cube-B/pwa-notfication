# 📖 1klive - คู่มือการติดตั้งและใช้งานแบบละเอียด

## 🎯 สิ่งที่คุณต้องมี

### Software Requirements
- ✅ Node.js version 18 ขึ้นไป (แนะนำ v20.x หรือ v22.x)
- ✅ PostgreSQL version 14 ขึ้นไป
- ✅ npm หรือ yarn package manager
- ✅ Text editor (VS Code แนะนำ)
- ✅ Terminal/Command Line

### Hardware Requirements
- ✅ Mac, Windows, หรือ Linux
- ✅ RAM อย่างน้อย 4GB
- ✅ มือถือสำหรับทดสอบ PWA (iOS หรือ Android)

---

## 📥 ขั้นตอนที่ 1: ติดตั้ง Prerequisites

### 1.1 ติดตั้ง Node.js

**macOS:**
```bash
# ใช้ Homebrew
brew install node@20
```

**Windows:**
- ดาวน์โหลดจาก: https://nodejs.org/
- เลือก LTS version
- ติดตั้งตามขั้นตอน

**ตรวจสอบการติดตั้ง:**
```bash
node --version  # ควรได้ v18.x, v20.x, หรือ v22.x
npm --version   # ควรได้ v9.x ขึ้นไป
```

### 1.2 ติดตั้ง PostgreSQL

**macOS:**
```bash
# ใช้ Homebrew
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- ดาวน์โหลด PostgreSQL จาก: https://www.postgresql.org/download/
- ติดตั้ง พร้อม pgAdmin 4
- จำ password ที่ตั้งไว้

**ตรวจสอบการติดตั้ง:**
```bash
psql --version  # ควรได้ PostgreSQL 14.x ขึ้นไป
```

---

## 🔧 ขั้นตอนที่ 2: Setup Backend

### 2.1 เข้าไปยัง Backend Directory

```bash
cd 1klive-fullstack/backend
```

### 2.2 ติดตั้ง Dependencies

```bash
npm install
```

คุณจะเห็น dependencies ที่ติดตั้ง:
- express (Web framework)
- cors (Cross-Origin Resource Sharing)
- pg (PostgreSQL client)
- web-push (Push notifications)
- และอื่นๆ

### 2.3 Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

คุณจะได้ output แบบนี้:
```
=======================================

Public Key:
BNxxx...xxx

Private Key:
xxx...xxx

=======================================
```

**⚠️ สำคัญ: คัดลอกและเก็บ keys ทั้งสองไว้!**

### 2.4 สร้างไฟล์ .env

```bash
# Copy from example
cp .env.example .env

# แก้ไขไฟล์ .env
nano .env  # หรือใช้ editor อื่น
```

แก้ไขให้ตรงกับข้อมูลของคุณ:

```env
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=1klive_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE  # 👈 แก้ไขตรงนี้

# VAPID Keys
VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE    # 👈 วาง Public Key ตรงนี้
VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE  # 👈 วาง Private Key ตรงนี้
VAPID_EMAIL=mailto:admin@1klive.com

NODE_ENV=development
```

### 2.5 สร้าง Database

```bash
# เข้าสู่ PostgreSQL
psql -U postgres

# สร้าง database ใหม่
CREATE DATABASE 1klive_db;

# ออกจาก psql
\q
```

### 2.6 Start Backend Server

```bash
npm run dev
```

คุณจะเห็น:
```
🎉 ====================================
🚀 1klive Backend Server Started!
🎉 ====================================

📡 Server running on: http://localhost:3000
🌐 Network access: http://0.0.0.0:3000

📋 Available endpoints:
  GET  /api/health
  GET  /api/notifications/vapid
  POST /api/notifications/subscribe
  ...
```

**ทดสอบ Backend:**
```bash
# ใน terminal ใหม่
curl http://localhost:3000/api/health

# ควรได้:
# {"status":"OK","service":"1klive", ...}
```

---

## 🎨 ขั้นตอนที่ 3: Setup Frontend

### 3.1 เข้าไปยัง Frontend Directory

```bash
# ใน terminal ใหม่
cd 1klive-fullstack/frontend
```

### 3.2 ติดตั้ง Dependencies

```bash
npm install
```

### 3.3 หา Local IP ของคุณ

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

คุณจะได้ IP แบบนี้:
- `192.168.1.XXX` (Wi-Fi ทั่วไป)
- `10.0.0.XXX` (บาง network)

### 3.4 แก้ไข Backend URL

แก้ไขไฟล์ `src/App.vue`:

```javascript
// หาบรรทัดนี้ (ประมาณบรรทัด 205)
const BACKEND_URL = 'http://localhost:3000'

// แก้เป็น
const BACKEND_URL = 'http://192.168.1.XXX:3000'  // 👈 ใส่ IP ของคุณ
```

### 3.5 แก้ไข Target URL (ถ้าต้องการ)

```javascript
// หาบรรทัดนี้ (ประมาณบรรทัด 203)
const TARGET_URL = 'https://1klive.com/'

// แก้เป็น URL ปลายทางของคุณ
const TARGET_URL = 'https://your-site.com/'  // 👈 ใส่ URL ของคุณ
```

### 3.6 Start Frontend Server

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

---

## 📱 ขั้นตอนที่ 4: ทดสอบบน Desktop

### 4.1 เปิดเบราว์เซอร์

เปิด Chrome หรือ Edge:
```
http://localhost:5173
```

### 4.2 ตรวจสอบ Console

กด `F12` เพื่อเปิด DevTools → Console

คุณจะเห็น logs:
```
🚀 1klive App mounted
🌐 Backend URL: http://192.168.1.XXX:3000
🎯 Target URL: https://1klive.com/
💻 Desktop detected
```

### 4.3 ตรวจสอบ Service Worker

DevTools → Application → Service Workers

ควรเห็น:
- ✅ sw.js (activated and is running)

---

## 📲 ขั้นตอนที่ 5: ทดสอบบนมือถือ (ผ่าน Local Network)

### 5.1 เชื่อมต่อมือถือกับ Wi-Fi เดียวกัน

ให้แน่ใจว่ามือถือและคอมพิวเตอร์อยู่ใน Wi-Fi network เดียวกัน

### 5.2 เปิดเบราว์เซอร์บนมือถือ

**Android:**
- เปิด Chrome

**iOS:**
- เปิด Safari

พิมพ์ URL:
```
http://192.168.1.XXX:5173
```
(แทน XXX ด้วย IP ของคุณ)

### 5.3 ลองติดตั้ง PWA

**⚠️ สำคัญ: PWA ต้องการ HTTPS บนมือถือ!**

ถ้าเปิดผ่าน HTTP จะไม่แสดงปุ่มติดตั้ง

---

## 🌐 ขั้นตอนที่ 6: ทดสอบผ่าน HTTPS (ngrok)

### 6.1 ติดตั้ง ngrok

**macOS:**
```bash
brew install ngrok
```

**Windows/Linux:**
- ดาวน์โหลดจาก: https://ngrok.com/download
- แตกไฟล์และย้ายไปที่ PATH

### 6.2 สร้าง Tunnel สำหรับ Frontend

```bash
ngrok http 5173
```

คุณจะได้ output:
```
Session Status                online
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:5173
```

### 6.3 เปิด HTTPS URL บนมือถือ

คัดลอก URL:
```
https://abc123xyz.ngrok-free.app
```

เปิดบนมือถือ (Chrome สำหรับ Android / Safari สำหรับ iOS)

### 6.4 ติดตั้ง PWA

**Android (Chrome):**
1. เปิด URL
2. กดปุ่ม "ติดตั้ง 1klive"
3. ยืนยันการติดตั้ง
4. เปิดแอปจาก Home Screen

**iOS (Safari):**
1. เปิด URL
2. กดปุ่ม แชร์ (📤)
3. เลือก "เพิ่มที่หน้าจอ Home"
4. กด "เพิ่ม"
5. เปิด 1klive จาก Home Screen

### 6.5 อนุญาตการแจ้งเตือน

หลังติดตั้ง PWA:
1. จะมีหน้า "เปิดการแจ้งเตือน"
2. กดปุ่ม "🔔 เปิดการแจ้งเตือน"
3. อนุญาต Notifications
4. รอ Welcome Notification

---

## 🔔 ขั้นตอนที่ 7: ทดสอบส่ง Notification

### 7.1 ส่ง Notification ผ่าน API

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎬 ทดสอบการแจ้งเตือน",
    "body": "นี่คือ notification ทดสอบจาก 1klive",
    "url": "https://1klive.com"
  }'
```

### 7.2 ตรวจสอบบนมือถือ

คุณควรเห็น notification pop up บนมือถือ

### 7.3 ตรวจสอบ Statistics

```bash
curl http://localhost:3000/api/notifications/stats | jq
```

Output:
```json
{
  "success": true,
  "stats": {
    "total": "1",
    "active": "1",
    "inactive": "0",
    "latest_subscription": "2024-XX-XX...",
    "latest_notification": "2024-XX-XX..."
  }
}
```

---

## 🐛 Troubleshooting Guide

### ปัญหา 1: Backend ไม่ start

**Error:** `Error: connect ECONNREFUSED`

**วิธีแก้:**
1. ตรวจสอบ PostgreSQL รันอยู่:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   systemctl status postgresql
   ```
2. ตรวจสอบ credentials ใน `.env`
3. ลองสร้าง database ใหม่:
   ```bash
   psql -U postgres
   DROP DATABASE 1klive_db;
   CREATE DATABASE 1klive_db;
   \q
   ```

### ปัญหา 2: Frontend ไม่เชื่อมต่อ Backend

**Error:** `CORS Error` หรือ `Network Error`

**วิธีแก้:**
1. ตรวจสอบ BACKEND_URL ใน `App.vue`
2. ตรวจสอบ Backend รันอยู่:
   ```bash
   curl http://localhost:3000/api/health
   ```
3. ตรวจสอบ IP address ถูกต้อง
4. ปิด firewall ชั่วคราว (สำหรับทดสอบ)

### ปัญหา 3: PWA ไม่แสดงปุ่มติดตั้ง

**สาเหตุ:**
- ไม่ได้ใช้ HTTPS
- manifest.json ไม่ถูกต้อง
- Service Worker ไม่ register

**วิธีแก้:**
1. ใช้ ngrok สำหรับ HTTPS
2. ตรวจสอบ Console errors
3. ตรวจสอบ DevTools → Application:
   - Manifest ✅
   - Service Workers ✅

### ปัญหา 4: Notification ไม่ทำงาน

**Error:** `Push registration failed` หรือไม่มี notification

**วิธีแก้:**
1. ตรวจสอบ VAPID keys ถูกต้อง
2. ตรวจสอบอนุญาต notifications แล้ว
3. ตรวจสอบ Service Worker active
4. ดู backend logs:
   ```bash
   # ใน terminal ที่รัน backend
   # ควรเห็น: "✅ Subscription saved to database"
   # และ: "✅ Welcome notification sent"
   ```

### ปัญหา 5: ngrok Warning Screen

**ปัญหา:** เห็นหน้า "You are about to visit..."

**วิธีแก้:**
- กด "Visit Site"
- หรือสมัคร ngrok account และ authenticate:
  ```bash
  ngrok config add-authtoken YOUR_TOKEN
  ```

---

## 📊 ตรวจสอบการทำงาน

### Backend Health Check
```bash
curl http://localhost:3000/api/health
```

### VAPID Public Key
```bash
curl http://localhost:3000/api/notifications/vapid
```

### Subscription Stats
```bash
curl http://localhost:3000/api/notifications/stats
```

### Database Inspection
```bash
psql -U postgres -d 1klive_db

# ดู subscriptions ทั้งหมด
SELECT * FROM subscriptions;

# นับจำนวน active subscriptions
SELECT COUNT(*) FROM subscriptions WHERE active = true;

\q
```

---

## 🎓 เคล็ดลับ

### 1. Development Tips
- ใช้ `console.log` เพื่อ debug
- เปิด DevTools ตลอดเวลา
- ตรวจสอบ Network tab สำหรับ API calls

### 2. Testing Tips
- ทดสอบบน desktop ก่อน
- ทดสอบบนมือถือจริง (local network)
- ทดสอบผ่าน HTTPS (ngrok)
- ทดสอบ notifications

### 3. Performance Tips
- Build for production: `npm run build`
- ใช้ CDN สำหรับ static files
- Enable compression
- Optimize images

---

## 📚 Resources

- [Vue.js Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## ✅ Checklist

### Setup Checklist
- [ ] Node.js ติดตั้งแล้ว
- [ ] PostgreSQL ติดตั้งและรันอยู่
- [ ] Backend dependencies ติดตั้งแล้ว
- [ ] VAPID keys generate แล้ว
- [ ] .env file แก้ไขถูกต้องแล้ว
- [ ] Database สร้างแล้ว
- [ ] Backend start สำเร็จ
- [ ] Frontend dependencies ติดตั้งแล้ว
- [ ] BACKEND_URL แก้ไขถูกต้องแล้ว
- [ ] Frontend start สำเร็จ

### Testing Checklist
- [ ] ทดสอบบน desktop ผ่าน localhost
- [ ] ทดสอบบนมือถือผ่าน local network
- [ ] ทดสอบผ่าน ngrok (HTTPS)
- [ ] PWA ติดตั้งได้
- [ ] Notification permission ขอได้
- [ ] Welcome notification ได้รับ
- [ ] ส่ง notification ทดสอบสำเร็จ
- [ ] Stats API ทำงาน

---

**หากมีปัญหาหรือคำถาม:**
- ดู Console logs ให้ละเอียด
- ตรวจสอบ Network tab
- อ่าน error messages ให้ครบ
- ลองค้นหา error message ใน Google

**Good luck! 🎉**
