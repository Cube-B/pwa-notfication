// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    ⚙️ Settings Routes v2.0.0                                  ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import { pool } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All settings routes require authentication
router.use(authMiddleware);

// ========================================
// 📋 Get All PWA Settings
// ========================================
router.get('/pwa', async (req, res) => {
  try {
    console.log('📋 Fetching PWA settings...');
    
    const result = await pool.query(`
      SELECT key, value, category, description
      FROM pwa_config
      ORDER BY category, key
    `);
    
    // Group by category
    const settings = {};
    result.rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      settings[row.category][row.key] = {
        value: row.value,
        description: row.description
      };
    });
    
    res.json({
      success: true,
      settings: settings
    });
    
  } catch (error) {
    console.error('❌ Get PWA settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PWA settings'
    });
  }
});

// ========================================
// 🔍 Get Single Setting
// ========================================
router.get('/pwa/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    console.log('🔍 Fetching setting:', key);
    
    const result = await pool.query(`
      SELECT key, value, category, description
      FROM pwa_config
      WHERE key = $1
    `, [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    res.json({
      success: true,
      setting: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Get setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch setting'
    });
  }
});

// ========================================
// ✏️ Update PWA Settings (Bulk)
// ========================================
router.put('/pwa', async (req, res) => {
  try {
    const { settings } = req.body;
    const adminId = req.user.id;
    
    console.log('✏️ Updating PWA settings...', Object.keys(settings).length, 'settings');
    
    // Only super_admin and admin can update settings
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update settings'
      });
    }
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings must be an object'
      });
    }
    
    // Update each setting
    const updates = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const updatePromise = pool.query(`
        UPDATE pwa_config 
        SET value = $1
        WHERE key = $2
        RETURNING key
      `, [value, key]);
      
      updates.push(updatePromise);
    }
    
    await Promise.all(updates);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, details)
      VALUES ($1, 'update_pwa_settings', 'pwa_config', $2)
    `, [
      adminId,
      JSON.stringify({ updated_keys: Object.keys(settings) })
    ]);
    
    console.log('✅ PWA settings updated');
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update PWA settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// ========================================
// ✏️ Update Single Setting
// ========================================
router.put('/pwa/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = req.user.id;
    
    console.log('✏️ Updating setting:', key);
    
    // Only super_admin and admin can update settings
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update settings'
      });
    }
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }
    
    const result = await pool.query(`
      UPDATE pwa_config 
      SET value = $1
      WHERE key = $2
      RETURNING key, value, category, description
    `, [value, key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, details)
      VALUES ($1, 'update_pwa_setting', 'pwa_config', $2)
    `, [
      adminId,
      JSON.stringify({ key, value })
    ]);
    
    console.log('✅ Setting updated:', key);
    
    res.json({
      success: true,
      setting: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Update setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update setting'
    });
  }
});

// ========================================
// 🔄 Reset to Default Settings
// ========================================
router.post('/pwa/reset', async (req, res) => {
  try {
    const adminId = req.user.id;
    
    console.log('🔄 Resetting PWA settings to default...');
    
    // Only super_admin can reset settings
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only super admins can reset settings'
      });
    }
    
    // Default settings (from migration)
    const defaults = {
      'app_name': '1klive',
      'app_short_name': '1klive',
      'app_description': 'Live streaming platform',
      'logo_url': 'https://1klive.com/assets/logo.png',
      'primary_color': '#667eea',
      'secondary_color': '#764ba2',
      'background_color': '#ffffff',
      'theme_color': '#667eea',
      'start_url': '/',
      'home_url': 'https://1klive.com',
      'support_url': 'https://1klive.com/support',
      'terms_url': 'https://1klive.com/terms',
      'privacy_url': 'https://1klive.com/privacy',
      'notification_icon_url': 'https://1klive.com/assets/notification-icon.png',
      'welcome_title': 'Welcome to 1klive!',
      'welcome_message': 'Thank you for enabling notifications.',
      'health_check_enabled': 'true',
      'health_check_interval': '300',
      'health_check_url': 'https://1klive.com/health',
      'health_check_timeout': '10'
    };
    
    // Update each setting
    const updates = [];
    
    for (const [key, value] of Object.entries(defaults)) {
      const updatePromise = pool.query(`
        UPDATE pwa_config 
        SET value = $1
        WHERE key = $2
      `, [value, key]);
      
      updates.push(updatePromise);
    }
    
    await Promise.all(updates);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, details)
      VALUES ($1, 'reset_pwa_settings', 'pwa_config', $2)
    `, [adminId, JSON.stringify({ reset_count: Object.keys(defaults).length })]);
    
    console.log('✅ PWA settings reset to default');
    
    res.json({
      success: true,
      message: 'Settings reset to default successfully'
    });
    
  } catch (error) {
    console.error('❌ Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset settings'
    });
  }
});

// ========================================
// 📊 Get System Settings
// ========================================
router.get('/system', async (req, res) => {
  try {
    console.log('📊 Fetching system settings...');
    
    const result = await pool.query(`
      SELECT key, value, type, description
      FROM system_settings
      ORDER BY key
    `);
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        type: row.type,
        description: row.description
      };
    });
    
    res.json({
      success: true,
      settings: settings
    });
    
  } catch (error) {
    console.error('❌ Get system settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system settings'
    });
  }
});

// ========================================
// ✏️ Update System Settings
// ========================================
router.put('/system', async (req, res) => {
  try {
    const { settings } = req.body;
    const adminId = req.user.id;
    
    console.log('✏️ Updating system settings...');
    
    // Only super_admin can update system settings
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only super admins can update system settings'
      });
    }
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings must be an object'
      });
    }
    
    // Update each setting
    const updates = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const updatePromise = pool.query(`
        UPDATE system_settings 
        SET value = $1
        WHERE key = $2
        RETURNING key
      `, [value, key]);
      
      updates.push(updatePromise);
    }
    
    await Promise.all(updates);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, details)
      VALUES ($1, 'update_system_settings', 'system_settings', $2)
    `, [
      adminId,
      JSON.stringify({ updated_keys: Object.keys(settings) })
    ]);
    
    console.log('✅ System settings updated');
    
    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update system settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update system settings'
    });
  }
});

export default router;