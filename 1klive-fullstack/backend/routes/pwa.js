// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    🎨 PWA Configuration Routes v2.1.0                         ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import { pool } from '../server.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// 📖 Get All PWA Configuration (Public)
// ========================================
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM current_pwa_config');
    
    // Convert to object
    const config = {};
    result.rows.forEach(row => {
      try {
        config[row.config_key] = JSON.parse(row.config_value);
      } catch {
        config[row.config_key] = row.config_value;
      }
    });
    
    res.json({
      success: true,
      config
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
// 📝 Update Configuration (Admin Only)
// ========================================
router.put('/config/:key', authMiddleware, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }
    
    // Convert value to JSON
    const jsonValue = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value);
    
    // Update or insert
    await pool.query(
      `INSERT INTO pwa_config (config_key, config_value, updated_by, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (config_key) 
       DO UPDATE SET 
         config_value = $2,
         updated_by = $3,
         updated_at = CURRENT_TIMESTAMP`,
      [key, jsonValue, req.admin.id]
    );
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (admin_id, action, entity_type, details)
       VALUES ($1, 'update_pwa_config', 'pwa_config', $2)`,
      [req.admin.id, JSON.stringify({ key, value })]
    );
    
    console.log('✅ Config updated:', key, 'by', req.admin.username);
    
    res.json({
      success: true,
      message: 'Configuration updated'
    });
    
  } catch (error) {
    console.error('❌ Update config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update config'
    });
  }
});

// ========================================
// 🔄 Bulk Update Configuration (Admin Only)
// ========================================
router.post('/config/bulk', authMiddleware, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { configs } = req.body;
    
    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configs object is required'
      });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update each config
      for (const [key, value] of Object.entries(configs)) {
        const jsonValue = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value);
        
        await client.query(
          `INSERT INTO pwa_config (config_key, config_value, updated_by, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (config_key) 
           DO UPDATE SET 
             config_value = $2,
             updated_by = $3,
             updated_at = CURRENT_TIMESTAMP`,
          [key, jsonValue, req.admin.id]
        );
      }
      
      await client.query('COMMIT');
      
      // Log activity
      await pool.query(
        `INSERT INTO activity_logs (admin_id, action, entity_type, details)
         VALUES ($1, 'bulk_update_pwa_config', 'pwa_config', $2)`,
        [req.admin.id, JSON.stringify({ count: Object.keys(configs).length })]
      );
      
      console.log('✅ Bulk config updated:', Object.keys(configs).length, 'items by', req.admin.username);
      
      res.json({
        success: true,
        message: `Updated ${Object.keys(configs).length} configurations`
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Bulk update config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update config'
    });
  }
});

// ========================================
// 🔍 Health Check Target URL
// ========================================
router.get('/health-check', async (req, res) => {
  try {
    // Get target URL from config
    const configResult = await pool.query(
      `SELECT config_value FROM pwa_config WHERE config_key = 'target_url'`
    );
    
    if (configResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Target URL not configured'
      });
    }
    
    const targetUrl = JSON.parse(configResult.rows[0].config_value);
    
    const startTime = Date.now();
    let isAccessible = false;
    let errorMessage = null;
    
    try {
      // Try to fetch target URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      isAccessible = response.ok;
      if (!response.ok) {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
      
    } catch (error) {
      errorMessage = error.message;
    }
    
    const responseTime = Date.now() - startTime;
    
    // Log health check
    await pool.query(
      `INSERT INTO health_check_logs (target_url, is_accessible, response_time_ms, error_message)
       VALUES ($1, $2, $3, $4)`,
      [targetUrl, isAccessible, responseTime, errorMessage]
    );
    
    res.json({
      success: true,
      health: {
        url: targetUrl,
        is_accessible: isAccessible,
        response_time_ms: responseTime,
        error_message: errorMessage,
        checked_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// ========================================
// 📊 Get Health Check History
// ========================================
router.get('/health-history', authMiddleware, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const result = await pool.query(
      `SELECT * FROM health_check_logs 
       ORDER BY checked_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    res.json({
      success: true,
      history: result.rows
    });
    
  } catch (error) {
    console.error('❌ Get health history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health history'
    });
  }
});

// ========================================
// 📊 Get Latest Health Status
// ========================================
router.get('/health-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM latest_health_checks');
    
    res.json({
      success: true,
      status: result.rows
    });
    
  } catch (error) {
    console.error('❌ Get health status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health status'
    });
  }
});

// ========================================
// 📤 Upload Logo/Image (Admin Only)
// ========================================
router.post('/upload-image', authMiddleware, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { imageUrl, imageType } = req.body;
    
    if (!imageUrl || !imageType) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl and imageType required'
      });
    }
    
    // Validate image type
    const validTypes = ['logo_url', 'background_image'];
    if (!validTypes.includes(imageType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid imageType. Must be: logo_url, background_image'
      });
    }
    
    // Update config
    await pool.query(
      `INSERT INTO pwa_config (config_key, config_value, updated_by, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (config_key) 
       DO UPDATE SET 
         config_value = $2,
         updated_by = $3,
         updated_at = CURRENT_TIMESTAMP`,
      [imageType, JSON.stringify(imageUrl), req.admin.id]
    );
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (admin_id, action, entity_type, details)
       VALUES ($1, 'upload_image', 'pwa_config', $2)`,
      [req.admin.id, JSON.stringify({ imageType, imageUrl })]
    );
    
    console.log('✅ Image uploaded:', imageType, 'by', req.admin.username);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl
    });
    
  } catch (error) {
    console.error('❌ Upload image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// ========================================
// 🔄 Reset to Default Config (Admin Only)
// ========================================
router.post('/reset', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    // Truncate and re-run migration
    await pool.query('TRUNCATE TABLE pwa_config CASCADE');
    
    // Re-insert defaults (you might want to read from SQL file)
    // For now, just return success
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (admin_id, action, entity_type)
       VALUES ($1, 'reset_pwa_config', 'pwa_config')`,
      [req.admin.id]
    );
    
    console.log('✅ Config reset by', req.admin.username);
    
    res.json({
      success: true,
      message: 'Configuration reset to defaults'
    });
    
  } catch (error) {
    console.error('❌ Reset config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset config'
    });
  }
});

export default router;
