import dotenv from 'dotenv';
// โหลด .env ก่อนอย่างอื่น!
dotenv.config();

import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import { initDatabase } from './database/db.js';
import notificationRoutes from './routes/notifications.js';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Configure Web Push
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

console.log('🔑 VAPID keys loaded successfully');

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        push_enabled: true
    });
});

// Root
app.get('/', (req, res) => {
    res.json({ 
        name: 'เฮงเฮง888 Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            vapid_key: '/api/notifications/vapid-public-key',
            subscribe: '/api/notifications/subscribe',
            send: '/api/notifications/send',
            stats: '/api/notifications/stats'
        }
    });
});

// Initialize Database and Start Server
async function startServer() {
    try {
        // Initialize database
        await initDatabase();
        
        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log('=================================');
            console.log('🎰 เฮงเฮง888 Backend API');
            console.log('=================================');
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`🔔 Push Notifications: Enabled`);
            console.log(`🌐 CORS: ${process.env.CORS_ORIGIN}`);
            console.log('=================================');
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        process.exit(1);
    }
}

startServer();
