// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    📊 Dashboard Routes v2.1.1 - FIXED                         ║
// ║    ✅ Aligned with Database Schema                           ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import { pool } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// ========================================
// 📊 Dashboard Stats
// ========================================
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    // Get all stats in parallel
    const [
      subscriptionsResult,
      notificationsResult,
      carriersResult,
      devicesResult,
      todayResult,
      recentNotificationsResult
    ] = await Promise.all([
      // Total subscriptions
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN active = true THEN 1 END) as active,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today
        FROM subscriptions
      `),
      
      // Notification stats - ✅ FIXED: ใช้ sent_count แทน success_count
      pool.query(`
        SELECT 
          COUNT(*) as total_sent,
          SUM(sent_count) as total_success,
          SUM(failed_count) as total_failed,
          COUNT(CASE WHEN sent_at >= CURRENT_DATE THEN 1 END) as today_sent
        FROM notification_logs
        WHERE status = 'sent'
      `),
      
      // Carrier breakdown
      pool.query(`
        SELECT 
          carrier,
          COUNT(*) as count
        FROM subscriptions
        WHERE carrier IS NOT NULL 
        AND has_mobile_carrier = true
        GROUP BY carrier
        ORDER BY count DESC
      `),
      
      // Device breakdown
      pool.query(`
        SELECT 
          device_type,
          COUNT(*) as count
        FROM subscriptions
        WHERE device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY count DESC
      `),
      
      // Today's activity
      pool.query(`
        SELECT 
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_subscriptions,
          COUNT(CASE WHEN carrier_detected_at >= CURRENT_DATE THEN 1 END) as carrier_detections
        FROM subscriptions
      `),
      
      // Recent notifications - ✅ FIXED: ใช้ total_count, sent_count
      pool.query(`
        SELECT 
          id,
          title,
          total_count,
          sent_count,
          failed_count,
          status,
          sent_at
        FROM notification_logs
        ORDER BY created_at DESC
        LIMIT 5
      `)
    ]);
    
    // Parse results
    const subscriptions = subscriptionsResult.rows[0];
    const notifications = notificationsResult.rows[0];
    const carriers = carriersResult.rows;
    const devices = devicesResult.rows;
    const today = todayResult.rows[0];
    const recentNotifications = recentNotificationsResult.rows;
    
    // Calculate success rate
    const totalNotifications = parseInt(notifications.total_success || 0) + parseInt(notifications.total_failed || 0);
    const successRate = totalNotifications > 0 
      ? ((parseInt(notifications.total_success || 0) / totalNotifications) * 100).toFixed(2)
      : 0;
    
    // Build response
    const stats = {
      subscriptions: {
        total: parseInt(subscriptions.total || 0),
        active: parseInt(subscriptions.active || 0),
        inactive: parseInt(subscriptions.total || 0) - parseInt(subscriptions.active || 0),
        today: parseInt(subscriptions.today || 0)
      },
      notifications: {
        total_sent: parseInt(notifications.total_sent || 0),
        total_success: parseInt(notifications.total_success || 0),
        total_failed: parseInt(notifications.total_failed || 0),
        success_rate: parseFloat(successRate),
        today_sent: parseInt(notifications.today_sent || 0)
      },
      carriers: carriers.reduce((acc, row) => {
        acc[row.carrier] = parseInt(row.count);
        return acc;
      }, {}),
      devices: devices.reduce((acc, row) => {
        acc[row.device_type] = parseInt(row.count);
        return acc;
      }, {}),
      today: {
        new_subscriptions: parseInt(today.new_subscriptions || 0),
        carrier_detections: parseInt(today.carrier_detections || 0)
      },
      recent_notifications: recentNotifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        recipients: notif.total_count,
        success: notif.sent_count,
        failed: notif.failed_count,
        status: notif.status,
        sent_at: notif.sent_at
      }))
    };
    
    console.log('✅ Dashboard stats fetched');
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      details: error.message
    });
  }
});

// ========================================
// 📈 Chart Data (Last 7 Days)
// ========================================
router.get('/charts', async (req, res) => {
  try {
    console.log('📈 Fetching chart data...');
    
    const { days = 7 } = req.query;
    
    // Get daily stats for the last N days
    const [subscriptionsChart, notificationsChart] = await Promise.all([
      // Daily subscriptions
      pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM subscriptions
        WHERE created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      
      // Daily notifications - ✅ FIXED: ใช้ sent_count และ status = 'sent'
      pool.query(`
        SELECT 
          DATE(sent_at) as date,
          COUNT(*) as count,
          SUM(sent_count) as success,
          SUM(failed_count) as failed
        FROM notification_logs
        WHERE sent_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
        AND status = 'sent'
        GROUP BY DATE(sent_at)
        ORDER BY date ASC
      `)
    ]);
    
    console.log('✅ Chart data fetched');
    
    res.json({
      success: true,
      charts: {
        subscriptions: subscriptionsChart.rows.map(row => ({
          date: row.date,
          count: parseInt(row.count)
        })),
        notifications: notificationsChart.rows.map(row => ({
          date: row.date,
          count: parseInt(row.count),
          success: parseInt(row.success || 0),
          failed: parseInt(row.failed || 0)
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Chart data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data',
      details: error.message
    });
  }
});

// ========================================
// 🕐 Recent Activity
// ========================================
router.get('/recent', async (req, res) => {
  try {
    console.log('🕐 Fetching recent activity...');
    
    const { limit = 20 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.created_at,
        a.username,
        a.full_name
      FROM activity_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [parseInt(limit)]);
    
    const activities = result.rows.map(row => ({
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      details: row.details,
      created_at: row.created_at,
      admin: {
        username: row.username,
        full_name: row.full_name
      }
    }));
    
    console.log('✅ Recent activity fetched:', activities.length, 'items');
    
    res.json({
      success: true,
      activities
    });
    
  } catch (error) {
    console.error('❌ Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      details: error.message
    });
  }
});

export default router;