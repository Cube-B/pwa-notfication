// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    📱 Notification Routes v2.1.1 - FIXED                      ║
// ║    ✅ Aligned with Database Schema                           ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import { pool } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import webpush from 'web-push';

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// ========================================
// 📊 Get Subscriptions (for targeting)
// ========================================
router.get('/subscriptions', async (req, res) => {
  try {
    console.log('📊 Fetching subscription stats...');
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = true THEN 1 END) as active,
        carrier,
        device_type
      FROM subscriptions
      WHERE active = true
      GROUP BY carrier, device_type
    `);
    
    // Get unique carriers and devices
    const carriers = [...new Set(result.rows.map(r => r.carrier).filter(Boolean))];
    const devices = [...new Set(result.rows.map(r => r.device_type).filter(Boolean))];
    
    // Get total counts
    const totals = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN active = true THEN 1 END) as active_subscriptions
      FROM subscriptions
    `);
    
    res.json({
      success: true,
      data: {
        total: parseInt(totals.rows[0].total_subscriptions || 0),
        active: parseInt(totals.rows[0].active_subscriptions || 0),
        carriers: carriers,
        devices: devices,
        breakdown: result.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions'
    });
  }
});

// ========================================
// 📤 Send Notification (Targeted)
// ========================================
router.post('/send', async (req, res) => {
  try {
    const { title, message, target, carriers, devices, url } = req.body;
    const adminId = req.admin?.id || 1;
    
    console.log('📤 Sending notification:', { title, target, carriers, devices });
    
    // Validate input
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }
    
    // Build query based on target
    let query = `SELECT * FROM subscriptions WHERE active = true`;
    const params = [];
    
    if (target === 'carriers' && carriers && carriers.length > 0) {
      query += ` AND carrier = ANY($1)`;
      params.push(carriers);
    } else if (target === 'devices' && devices && devices.length > 0) {
      query += ` AND device_type = ANY($1)`;
      params.push(devices);
    }
    // 'all' target = no additional filters
    
    const subscriptionsResult = await pool.query(query, params);
    const subscriptions = subscriptionsResult.rows;
    
    if (subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active subscriptions match the target'
      });
    }
    
    console.log(`✅ Found ${subscriptions.length} subscriptions to notify`);
    
    // Create notification log - ✅ FIXED: ใช้ column names ที่ถูกต้อง
    const logResult = await pool.query(`
      INSERT INTO notification_logs 
        (admin_id, title, body, url, target, carriers, device_types, total_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sent')
      RETURNING id
    `, [
      adminId,
      title,
      message,
      url || null,
      target || 'all',
      JSON.stringify(carriers || []),
      JSON.stringify(devices || []),
      subscriptions.length
    ]);
    
    const logId = logResult.rows[0].id;
    
    // Send notifications
    let successCount = 0;
    let failedCount = 0;
    
    const notificationPayload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      url: url || '/',
      timestamp: Date.now()
    });
    
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth
          }
        };
        
        await webpush.sendNotification(pushSubscription, notificationPayload);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to send to subscription ${sub.id}:`, error.message);
        failedCount++;
        
        // Mark subscription as inactive if error is permanent
        if (error.statusCode === 410 || error.statusCode === 404) {
          await pool.query(
            `UPDATE subscriptions SET active = false WHERE id = $1`,
            [sub.id]
          );
        }
      }
    }
    
    // Update notification log - ✅ FIXED: ใช้ sent_count แทน success_count
    await pool.query(`
      UPDATE notification_logs 
      SET 
        sent_count = $1,
        failed_count = $2,
        status = 'sent',
        sent_at = NOW()
      WHERE id = $3
    `, [successCount, failedCount, logId]);
    
    // Log admin activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'send_notification', 'notification', $2, $3)
    `, [
      adminId,
      logId,
      JSON.stringify({ title, target, recipients: subscriptions.length, success: successCount })
    ]);
    
    console.log(`✅ Notification sent: ${successCount} success, ${failedCount} failed`);
    
    res.json({
      success: true,
      data: {
        log_id: logId,
        total: subscriptions.length,
        success: successCount,
        failed: failedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      details: error.message
    });
  }
});

// ========================================
// 📢 Broadcast Notification (All)
// ========================================
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, url } = req.body;
    const adminId = req.admin?.id || 1;
    
    console.log('📢 Broadcasting notification:', title);
    
    // Validate input
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }
    
    // Get all active subscriptions
    const subscriptionsResult = await pool.query(
      `SELECT * FROM subscriptions WHERE active = true`
    );
    const subscriptions = subscriptionsResult.rows;
    
    if (subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active subscriptions'
      });
    }
    
    console.log(`✅ Broadcasting to ${subscriptions.length} subscriptions`);
    
    // Create notification log - ✅ FIXED
    const logResult = await pool.query(`
      INSERT INTO notification_logs 
        (admin_id, title, body, url, target, total_count, status)
      VALUES ($1, $2, $3, $4, 'all', $5, 'sent')
      RETURNING id
    `, [adminId, title, message, url || null, subscriptions.length]);
    
    const logId = logResult.rows[0].id;
    
    // Send notifications
    let successCount = 0;
    let failedCount = 0;
    
    const notificationPayload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      url: url || '/',
      timestamp: Date.now()
    });
    
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth
          }
        };
        
        await webpush.sendNotification(pushSubscription, notificationPayload);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to send to subscription ${sub.id}:`, error.message);
        failedCount++;
        
        // Mark subscription as inactive if error is permanent
        if (error.statusCode === 410 || error.statusCode === 404) {
          await pool.query(
            `UPDATE subscriptions SET active = false WHERE id = $1`,
            [sub.id]
          );
        }
      }
    }
    
    // Update notification log - ✅ FIXED
    await pool.query(`
      UPDATE notification_logs 
      SET 
        sent_count = $1,
        failed_count = $2,
        status = 'sent',
        sent_at = NOW()
      WHERE id = $3
    `, [successCount, failedCount, logId]);
    
    // Log admin activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'broadcast_notification', 'notification', $2, $3)
    `, [
      adminId,
      logId,
      JSON.stringify({ title, recipients: subscriptions.length, success: successCount })
    ]);
    
    console.log(`✅ Broadcast complete: ${successCount} success, ${failedCount} failed`);
    
    res.json({
      success: true,
      data: {
        log_id: logId,
        total: subscriptions.length,
        success: successCount,
        failed: failedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification',
      details: error.message
    });
  }
});

// ========================================
// 📋 Get Notification Templates
// ========================================
router.get('/templates', async (req, res) => {
  try {
    console.log('📋 Fetching notification templates...');
    
    const result = await pool.query(`
      SELECT 
        id, name, title, body, url, icon_url, badge_url,
        created_at, updated_at
      FROM notification_templates
      ORDER BY name
    `);
    
    res.json({
      success: true,
      templates: result.rows
    });
    
  } catch (error) {
    console.error('❌ Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// ========================================
// ➕ Create Notification Template
// ========================================
router.post('/templates', async (req, res) => {
  try {
    const { name, title, message, url } = req.body;
    const adminId = req.admin?.id || 1;
    
    console.log('➕ Creating template:', name);
    
    // Validate input
    if (!name || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, title, and message are required'
      });
    }
    
    const result = await pool.query(`
      INSERT INTO notification_templates 
        (name, title, body, url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, title, message, url || null]);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'create_template', 'notification_template', $2, $3)
    `, [adminId, result.rows[0].id, JSON.stringify({ name, title })]);
    
    console.log('✅ Template created:', result.rows[0].id);
    
    res.json({
      success: true,
      template: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Create template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
});

// ========================================
// 📜 Get Notification Logs (History)
// ========================================
router.get('/logs', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    console.log('📜 Fetching notification logs...', { limit, offset });
    
    // ✅ FIXED: ใช้ column names ที่ถูกต้องตาม database schema
    const result = await pool.query(`
      SELECT 
        nl.id,
        nl.title,
        nl.body,
        nl.url,
        nl.target,
        nl.carriers,
        nl.device_types,
        nl.total_count,
        nl.sent_count,
        nl.failed_count,
        nl.status,
        nl.created_at,
        nl.sent_at,
        a.username as created_by_username
      FROM notification_logs nl
      LEFT JOIN admins a ON nl.admin_id = a.id
      ORDER BY nl.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      logs: result.rows
    });
    
  } catch (error) {
    console.error('❌ Get notification logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification logs',
      details: error.message
    });
  }
});

export default router;