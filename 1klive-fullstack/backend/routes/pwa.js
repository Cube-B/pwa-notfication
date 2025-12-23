// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    🎨 PWA Public Routes v2.2.0 - Dynamic Config              ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import { pool } from '../server.js';

const router = express.Router();

// ========================================
// 📖 Get PWA Configuration (Public)
// ========================================
router.get('/config', async (req, res) => {
  try {
    console.log('📖 Fetching PWA config...');
    
    const result = await pool.query(`
      SELECT key, value, category
      FROM pwa_config
      ORDER BY category, key
    `);
    
    // Group by category
    const config = {};
    result.rows.forEach(row => {
      if (!config[row.category]) {
        config[row.category] = {};
      }
      config[row.category][row.key] = row.value;
    });
    
    res.json({
      success: true,
      config: config
    });
    
  } catch (error) {
    console.error('❌ Get config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get config'
    });
  }
});

// ========================================
// 📱 Get Dynamic PWA Manifest (Public)
// ========================================
router.get('/manifest.json', async (req, res) => {
  try {
    console.log('📱 Generating dynamic manifest...');
    
    const result = await pool.query(`
      SELECT key, value
      FROM pwa_config
      WHERE category IN ('branding', 'urls')
    `);
    
    // Convert to object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    // Generate manifest
    const manifest = {
      name: settings.app_name || '1klive',
      short_name: settings.app_short_name || '1klive',
      description: settings.app_description || 'Live streaming platform',
      start_url: settings.start_url || '/',
      display: 'standalone',
      background_color: settings.background_color || '#ffffff',
      theme_color: settings.theme_color || '#667eea',
      orientation: 'portrait-primary',
      icons: [
        {
          src: settings.logo_url || '/logo.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: settings.logo_url || '/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      categories: ['entertainment', 'lifestyle'],
      screenshots: [
        {
          src: settings.logo_url || '/logo.png',
          sizes: '540x720',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ],
      shortcuts: [
        {
          name: 'Home',
          url: settings.home_url || '/',
          icons: [
            {
              src: settings.logo_url || '/logo.png',
              sizes: '96x96'
            }
          ]
        }
      ]
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.json(manifest);
    
  } catch (error) {
    console.error('❌ Generate manifest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate manifest'
    });
  }
});

// ========================================
// 💾 Subscribe to Notifications (Public)
// ========================================
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, carrier, device_type, user_agent } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription'
      });
    }
    
    console.log('💾 Saving subscription...');
    console.log('Endpoint:', subscription.endpoint.substring(0, 50) + '...');
    console.log('Carrier:', carrier || 'Unknown');
    console.log('Device:', device_type || 'Unknown');
    
    // Upsert subscription
    await pool.query(`
      INSERT INTO subscriptions 
        (endpoint, p256dh, auth, carrier, device_type, user_agent, active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (endpoint) 
      DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        carrier = COALESCE(EXCLUDED.carrier, subscriptions.carrier),
        device_type = COALESCE(EXCLUDED.device_type, subscriptions.device_type),
        user_agent = COALESCE(EXCLUDED.user_agent, subscriptions.user_agent),
        active = true,
        updated_at = CURRENT_TIMESTAMP
    `, [
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      carrier,
      device_type,
      user_agent
    ]);
    
    console.log('✅ Subscription saved');
    
    res.json({
      success: true,
      message: 'Subscription saved successfully'
    });
    
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save subscription'
    });
  }
});

// ========================================
// 🗑️ Unsubscribe (Public)
// ========================================
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint is required'
      });
    }
    
    console.log('🗑️ Unsubscribing:', endpoint.substring(0, 50) + '...');
    
    await pool.query(`
      UPDATE subscriptions 
      SET active = false, updated_at = CURRENT_TIMESTAMP
      WHERE endpoint = $1
    `, [endpoint]);
    
    console.log('✅ Unsubscribed');
    
    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
    
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe'
    });
  }
});

// ========================================
// 💚 Health Check (Public)
// ========================================
router.get('/health', async (req, res) => {
  try {
    // Check database
    await pool.query('SELECT 1');
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;