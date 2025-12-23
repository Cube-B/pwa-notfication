# 🚀 1klive - Quick Start Guide

เริ่มต้นใช้งานภายใน 5 นาที!

## ⚡ Super Quick Setup

### 1. Clone & Install

```bash
# Clone repository (or extract downloaded files)
cd 1klive-fullstack

# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

### 2. Generate VAPID Keys

```bash
cd backend
node generate-vapid-keys.js
```

คัดลอก keys ที่ได้ไปใส่ใน `.env`

### 3. Setup Database

```bash
# เข้าสู่ PostgreSQL
psql -U postgres

# สร้าง database
CREATE DATABASE 1klive_db;
\q
```

### 4. Configure Environment

แก้ไข `backend/.env`:
```env
DB_PASSWORD=your_postgres_password
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_EMAIL=mailto:your@email.com
```

แก้ไข `frontend/src/App.vue`:
```javascript
// หาบรรทัด ~205
const BACKEND_URL = 'http://YOUR_IP:3000'  // แก้ IP ของคุณ
```

### 5. Start Servers

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## 📱 Test on Mobile

### Option 1: Local Network (HTTP only - no PWA install)
```
http://YOUR_IP:5173
```

### Option 2: ngrok (HTTPS - with PWA install)
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Create tunnel
ngrok http 5173

# Open the HTTPS URL on your phone
```

## 🧪 Test Everything Works

### 1. Check Backend
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"OK"...}
```

### 2. Install PWA on Phone
1. Open ngrok HTTPS URL on mobile
2. Click "ติดตั้ง 1klive"
3. Click "เปิดการแจ้งเตือน"
4. Allow notifications

### 3. Send Test Notification
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎬 Test Notification",
    "body": "It works!",
    "url": "https://1klive.com"
  }'
```

Check your phone - you should see the notification! 🎉

## 📋 Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed and running
- [ ] Dependencies installed (backend & frontend)
- [ ] VAPID keys generated
- [ ] `.env` configured
- [ ] Database created
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Tested on mobile via ngrok
- [ ] PWA installed
- [ ] Notifications working

## 🆘 Problems?

### Backend won't start
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Check .env file exists and has correct values
cat backend/.env
```

### Frontend can't connect
```bash
# Check BACKEND_URL in App.vue matches your IP
# Check backend is actually running
curl http://localhost:3000/api/health
```

### PWA won't install
- Make sure you're using HTTPS (ngrok)
- Check browser console for errors
- Try clearing cache and reloading

### Notifications don't work
- Check VAPID keys are correct in `.env`
- Check permissions were granted on phone
- Check backend logs for errors

## 📖 Need More Help?

Read the full documentation:
- [README.md](./README.md) - Complete overview
- [INSTRUCTIONS.md](./INSTRUCTIONS.md) - Detailed setup guide

## 💡 Pro Tips

1. **Development**
   - Keep DevTools open
   - Watch console logs
   - Use `console.log` for debugging

2. **Testing**
   - Always test on real devices
   - Test both iOS and Android
   - Test with poor network conditions

3. **Deployment**
   - Use environment variables for production
   - Enable HTTPS for production
   - Use PM2 or similar for backend
   - Use CDN for static files

## 🎯 Next Steps

Once everything works:

1. **Customize**
   - Change colors in `style.css`
   - Update logo in `public/logo.png`
   - Change app name in `manifest.json`

2. **Deploy**
   - Deploy frontend to Netlify/Vercel
   - Deploy backend to Railway/Heroku
   - Setup production database

3. **Enhance**
   - Add user authentication
   - Add notification preferences
   - Add analytics
   - Add more features!

---

**Happy coding! 🚀**

Need help? Check [INSTRUCTIONS.md](./INSTRUCTIONS.md) for detailed troubleshooting.
