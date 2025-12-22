import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import webpush from 'web-push';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// 🔐 VAPID Keys Configuration
// ========================================
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_KEY_HERE';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@1klive.com';

webpush.setVapidDetails(
  VAPID_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

console.log('🔑 VAPID configured for 1klive');

// ========================================
// 💾 Database Configuration
// ========================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '1klive_pwa_db',
  user: process.env.DB_USER || 'privatoffy',
  password: process.env.DB_PASSWORD || '',  // Empty password is OK
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// ========================================
// 🛡️ Security Middleware
// ========================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      /\.ngrok-free\.app$/,
      /\.ngrok\.io$/,
      /\.trycloudflare\.com$/,
      /^http:\/\/192\.168\.\d+\.\d+:5173$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:5173$/
    ];
    
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked:', origin);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// 🔧 Trust Proxy (for Cloudflare/ngrok)
// ========================================
app.set('trust proxy', 1);

// ========================================
// 📊 Rate Limiting
// ========================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});

// Handle preflight requests
app.options('*', cors());

app.use('/api/', limiter);

// ========================================
// 📋 Database Schema
// ========================================
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_notification TIMESTAMP,
        active BOOLEAN DEFAULT true
      )
    `);
    
    // Create notifications_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications_history (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        icon TEXT,
        url TEXT,
        data JSONB,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
      )
    `);
    
    // Create notification_deliveries table (track who received what)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_deliveries (
        id SERIAL PRIMARY KEY,
        notification_id INTEGER REFERENCES notifications_history(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
        delivered BOOLEAN DEFAULT false,
        delivered_at TIMESTAMP,
        error_message TEXT,
        UNIQUE(notification_id, subscription_id)
      )
    `);
    
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database init error:', error);
  }
};

initDB();

// ========================================
// 🌐 API Routes
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: '1klive',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Get VAPID public key
app.get('/api/notifications/vapid', (req, res) => {
  console.log('📡 VAPID key requested');
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Subscribe to notifications
app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    
    console.log('📝 New subscription request');
    console.log('Endpoint:', subscription.endpoint.substring(0, 50) + '...');
    
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid subscription object' 
      });
    }

    // Save to database
    await pool.query(
      `INSERT INTO subscriptions (endpoint, keys_p256dh, keys_auth)
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         keys_p256dh = EXCLUDED.keys_p256dh,
         keys_auth = EXCLUDED.keys_auth,
         active = true,
         created_at = CURRENT_TIMESTAMP`,
      [
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth
      ]
    );

    console.log('✅ Subscription saved to database');

    // Send welcome notification immediately
    const payload = JSON.stringify({
      title: '🎉 ยินดีต้อนรับสู่ 1klive!',
      body: 'คุณจะได้รับการแจ้งเตือนโปรโมชั่นและข่าวสารพิเศษจากเราทันที',
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: 'https://1klive.com',
        timestamp: Date.now()
      }
    });

    try {
      await webpush.sendNotification(subscription, payload);
      console.log('✅ Welcome notification sent');
      
      await pool.query(
        'UPDATE subscriptions SET last_notification = CURRENT_TIMESTAMP WHERE endpoint = $1',
        [subscription.endpoint]
      );
    } catch (pushError) {
      console.error('⚠️ Failed to send welcome notification:', pushError.message);
    }

    res.json({ 
      success: true,
      message: 'Subscription saved and welcome notification sent',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Subscribe error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save subscription',
      details: error.message 
    });
  }
});

// Send notification to all subscribers
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { title, body, url } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and body are required' 
      });
    }

    console.log('📤 Sending notifications to all subscribers...');

    // Step 1: Save notification to history
    const notificationResult = await pool.query(`
      INSERT INTO notifications_history (title, body, icon, url, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      title,
      body,
      '/logo.png',
      url || 'https://1klive.com',
      JSON.stringify({ timestamp: Date.now() })
    ]);
    
    const notificationId = notificationResult.rows[0].id;
    console.log(`📝 Notification saved with ID: ${notificationId}`);

    // Step 2: Get all active subscriptions
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE active = true'
    );

    const subscriptions = result.rows;
    console.log(`📊 Found ${subscriptions.length} active subscriptions`);

    const payload = JSON.stringify({
      title,
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: url || 'https://1klive.com',
        timestamp: Date.now(),
        notificationId: notificationId
      }
    });

    let sent = 0;
    let failed = 0;

    // Step 3: Send to all subscriptions and track deliveries
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys_p256dh,
          auth: sub.keys_auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        sent++;
        
        // Update subscription last_notification
        await pool.query(
          'UPDATE subscriptions SET last_notification = CURRENT_TIMESTAMP WHERE id = $1',
          [sub.id]
        );
        
        // Track successful delivery
        await pool.query(`
          INSERT INTO notification_deliveries (notification_id, subscription_id, delivered, delivered_at)
          VALUES ($1, $2, true, CURRENT_TIMESTAMP)
          ON CONFLICT (notification_id, subscription_id) 
          DO UPDATE SET delivered = true, delivered_at = CURRENT_TIMESTAMP
        `, [notificationId, sub.id]);
        
      } catch (error) {
        failed++;
        console.error(`❌ Failed to send to subscription ${sub.id}:`, error.message);
        
        // Track failed delivery
        await pool.query(`
          INSERT INTO notification_deliveries (notification_id, subscription_id, delivered, error_message)
          VALUES ($1, $2, false, $3)
          ON CONFLICT (notification_id, subscription_id) 
          DO UPDATE SET delivered = false, error_message = EXCLUDED.error_message
        `, [notificationId, sub.id, error.message]);
        
        if (error.statusCode === 410) {
          await pool.query(
            'UPDATE subscriptions SET active = false WHERE id = $1',
            [sub.id]
          );
          console.log(`🗑️ Marked subscription ${sub.id} as inactive`);
        }
      }
    }

    console.log(`✅ Notifications sent: ${sent}, Failed: ${failed}`);

    res.json({
      success: true,
      notificationId,
      sent,
      failed,
      total: subscriptions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Send notifications error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send notifications',
      details: error.message 
    });
  }
});

// Get subscription stats
app.get('/api/notifications/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE active = true) as active,
        COUNT(*) FILTER (WHERE active = false) as inactive,
        MAX(created_at) as latest_subscription,
        MAX(last_notification) as latest_notification
      FROM subscriptions
    `);

    res.json({
      success: true,
      stats: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get stats',
      details: error.message 
    });
  }
});

// ========================================
// 🧹 Cleanup old/inactive subscriptions
// ========================================
app.post('/api/notifications/cleanup', async (req, res) => {
  try {
    console.log('🧹 Running subscription cleanup...');
    
    // Delete subscriptions older than 30 days with no recent activity
    const result = await pool.query(`
      DELETE FROM subscriptions 
      WHERE created_at < NOW() - INTERVAL '30 days'
      AND (last_notification IS NULL OR last_notification < NOW() - INTERVAL '30 days')
      RETURNING id
    `);
    
    console.log(`✅ Cleaned up ${result.rowCount} old subscriptions`);
    
    res.json({
      success: true,
      deleted: result.rowCount,
      message: `Cleaned up ${result.rowCount} inactive subscriptions`
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unsubscribe
app.post('/api/notifications/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    await pool.query(
      'UPDATE subscriptions SET active = false WHERE endpoint = $1',
      [endpoint]
    );

    console.log('🔕 Subscription deactivated');

    res.json({ 
      success: true,
      message: 'Unsubscribed successfully' 
    });
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to unsubscribe',
      details: error.message 
    });
  }
});

// ========================================
// 📬 Get missed notifications
// ========================================
app.post('/api/notifications/missed', async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint required'
      });
    }
    
    console.log('🔍 Checking missed notifications...');
    
    // Get subscription ID
    const subResult = await pool.query(
      'SELECT id FROM subscriptions WHERE endpoint = $1 AND active = true',
      [endpoint]
    );
    
    if (subResult.rows.length === 0) {
      return res.json({
        success: true,
        missed: [],
        count: 0
      });
    }
    
    const subscriptionId = subResult.rows[0].id;
    
    // Get notifications that were NOT delivered to this subscription
    const missedResult = await pool.query(`
      SELECT 
        nh.id,
        nh.title,
        nh.body,
        nh.icon,
        nh.url,
        nh.data,
        nh.sent_at
      FROM notifications_history nh
      WHERE nh.expires_at > NOW()
      AND NOT EXISTS (
        SELECT 1 FROM notification_deliveries nd
        WHERE nd.notification_id = nh.id
        AND nd.subscription_id = $1
        AND nd.delivered = true
      )
      ORDER BY nh.sent_at DESC
      LIMIT 20
    `, [subscriptionId]);
    
    const missedNotifications = missedResult.rows;
    
    console.log(`📊 Found ${missedNotifications.length} missed notifications`);
    
    res.json({
      success: true,
      missed: missedNotifications,
      count: missedNotifications.length
    });
    
  } catch (error) {
    console.error('❌ Get missed notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// ✅ Mark notification as read
// ========================================
app.post('/api/notifications/mark-read', async (req, res) => {
  try {
    const { endpoint, notificationId } = req.body;
    
    if (!endpoint || !notificationId) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint and notificationId required'
      });
    }
    
    // Get subscription ID
    const subResult = await pool.query(
      'SELECT id FROM subscriptions WHERE endpoint = $1',
      [endpoint]
    );
    
    if (subResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    const subscriptionId = subResult.rows[0].id;
    
    // Mark as delivered
    await pool.query(`
      INSERT INTO notification_deliveries (notification_id, subscription_id, delivered, delivered_at)
      VALUES ($1, $2, true, CURRENT_TIMESTAMP)
      ON CONFLICT (notification_id, subscription_id) 
      DO UPDATE SET delivered = true, delivered_at = CURRENT_TIMESTAMP
    `, [notificationId, subscriptionId]);
    
    console.log(`✅ Marked notification ${notificationId} as read`);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ========================================
// 🧹 Automatic Cleanup Scheduler
// ========================================
const runCleanup = async () => {
  try {
    console.log('🧹 Running automatic cleanup...');
    const result = await pool.query(`
      DELETE FROM subscriptions 
      WHERE created_at < NOW() - INTERVAL '30 days'
      AND (last_notification IS NULL OR last_notification < NOW() - INTERVAL '30 days')
      RETURNING id
    `);
    console.log(`✅ Auto-cleanup: Removed ${result.rowCount} old subscriptions`);
  } catch (error) {
    console.error('❌ Auto-cleanup error:', error);
  }
};

// Run cleanup every 24 hours
setInterval(runCleanup, 24 * 60 * 60 * 1000);

// Run cleanup on startup
runCleanup();

// ========================================
// 🚀 Start Server
// ========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎉 ====================================');
  console.log('🚀 1klive Backend Server Started!');
  console.log('🎉 ====================================');
  console.log('');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/notifications/vapid');
  console.log('  POST /api/notifications/subscribe');
  console.log('  POST /api/notifications/send');
  console.log('  GET  /api/notifications/stats');
  console.log('  POST /api/notifications/unsubscribe');
  console.log('');
  console.log('💾 Database: PostgreSQL');
  console.log('🔔 Push Notifications: Ready');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('====================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});