// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    📱 Subscription Management Routes v2.0.0                   ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import { pool } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All subscription routes require authentication
router.use(authMiddleware);

// ========================================
// 📋 Get All Subscriptions (with filters)
// ========================================
router.get('/', async (req, res) => {
  try {
    const {
      search,
      carrier,
      device,
      active,
      limit = 50,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;
    
    console.log('📋 Fetching subscriptions...', { search, carrier, device, active });
    
    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramCount = 1;
    
    if (search) {
      conditions.push(`(endpoint ILIKE $${paramCount} OR user_agent ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }
    
    if (carrier) {
      conditions.push(`carrier = $${paramCount}`);
      values.push(carrier);
      paramCount++;
    }
    
    if (device) {
      conditions.push(`device_type = $${paramCount}`);
      values.push(device);
      paramCount++;
    }
    
    if (active !== undefined) {
      conditions.push(`active = $${paramCount}`);
      values.push(active === 'true');
      paramCount++;
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
    
    // Validate sort_by
    const validSortFields = ['created_at', 'updated_at', 'carrier', 'device_type'];
    const sortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM subscriptions ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].total);
    
    // Get subscriptions
    values.push(parseInt(limit));
    values.push(parseInt(offset));
    
    const result = await pool.query(`
      SELECT 
        id, endpoint, p256dh, auth, user_agent,
        carrier, device_type, active,
        created_at, updated_at
      FROM subscriptions
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, values);
    
    res.json({
      success: true,
      subscriptions: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + result.rows.length) < totalCount
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
// 🔍 Get Single Subscription
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching subscription:', id);
    
    const result = await pool.query(`
      SELECT 
        id, endpoint, p256dh, auth, user_agent,
        carrier, device_type, active,
        created_at, updated_at
      FROM subscriptions
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      subscription: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    });
  }
});

// ========================================
// 🗑️ Delete Subscription
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    console.log('🗑️ Deleting subscription:', id);
    
    // Get subscription info before deleting
    const subInfo = await pool.query(
      `SELECT endpoint, carrier, device_type FROM subscriptions WHERE id = $1`,
      [id]
    );
    
    if (subInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    // Delete subscription
    await pool.query(`DELETE FROM subscriptions WHERE id = $1`, [id]);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'delete_subscription', 'subscription', $2, $3)
    `, [
      adminId,
      id,
      JSON.stringify({
        carrier: subInfo.rows[0].carrier,
        device_type: subInfo.rows[0].device_type
      })
    ]);
    
    console.log('✅ Subscription deleted:', id);
    
    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subscription'
    });
  }
});

// ========================================
// 🗑️ Bulk Delete Subscriptions
// ========================================
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    const adminId = req.user.id;
    
    console.log('🗑️ Bulk deleting subscriptions:', ids?.length);
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required'
      });
    }
    
    // Delete subscriptions
    const result = await pool.query(
      `DELETE FROM subscriptions WHERE id = ANY($1) RETURNING id`,
      [ids]
    );
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, details)
      VALUES ($1, 'bulk_delete_subscriptions', 'subscription', $2)
    `, [
      adminId,
      JSON.stringify({ count: result.rows.length, ids })
    ]);
    
    console.log('✅ Bulk deleted:', result.rows.length, 'subscriptions');
    
    res.json({
      success: true,
      deleted_count: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subscriptions'
    });
  }
});

// ========================================
// 📊 Get Subscription Statistics
// ========================================
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 Fetching subscription statistics...');
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = true THEN 1 END) as active,
        COUNT(CASE WHEN active = false THEN 1 END) as inactive,
        COUNT(DISTINCT carrier) as carriers_count,
        COUNT(DISTINCT device_type) as devices_count,
        carrier,
        device_type,
        COUNT(*) as count
      FROM subscriptions
      GROUP BY ROLLUP(carrier, device_type)
    `);
    
    // Parse results
    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      carriers: {},
      devices: {}
    };
    
    result.rows.forEach(row => {
      if (!row.carrier && !row.device_type) {
        // Overall stats
        stats.total = parseInt(row.total);
        stats.active = parseInt(row.active);
        stats.inactive = parseInt(row.inactive);
      } else if (row.carrier && !row.device_type) {
        // By carrier
        stats.carriers[row.carrier] = parseInt(row.count);
      } else if (!row.carrier && row.device_type) {
        // By device
        stats.devices[row.device_type] = parseInt(row.count);
      }
    });
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// ========================================
// 📥 Export Subscriptions to CSV
// ========================================
router.get('/export/csv', async (req, res) => {
  try {
    const { carrier, device, active } = req.query;
    
    console.log('📥 Exporting subscriptions to CSV...');
    
    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramCount = 1;
    
    if (carrier) {
      conditions.push(`carrier = $${paramCount}`);
      values.push(carrier);
      paramCount++;
    }
    
    if (device) {
      conditions.push(`device_type = $${paramCount}`);
      values.push(device);
      paramCount++;
    }
    
    if (active !== undefined) {
      conditions.push(`active = $${paramCount}`);
      values.push(active === 'true');
      paramCount++;
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
    
    const result = await pool.query(`
      SELECT 
        id, endpoint, carrier, device_type, user_agent,
        active, created_at, updated_at
      FROM subscriptions
      ${whereClause}
      ORDER BY created_at DESC
    `, values);
    
    // Convert to CSV
    const headers = ['ID', 'Endpoint', 'Carrier', 'Device', 'User Agent', 'Active', 'Created At', 'Updated At'];
    const rows = result.rows.map(row => [
      row.id,
      row.endpoint,
      row.carrier || '',
      row.device_type || '',
      row.user_agent || '',
      row.active ? 'Yes' : 'No',
      new Date(row.created_at).toISOString(),
      new Date(row.updated_at).toISOString()
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(field => {
        // Escape fields containing commas or quotes
        if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="subscriptions-${Date.now()}.csv"`);
    res.send(csv);
    
    console.log('✅ Exported', result.rows.length, 'subscriptions to CSV');
    
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export subscriptions'
    });
  }
});

// ========================================
// 🔄 Toggle Subscription Active Status
// ========================================
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    console.log('🔄 Toggling subscription active status:', id);
    
    const result = await pool.query(`
      UPDATE subscriptions 
      SET active = NOT active
      WHERE id = $1
      RETURNING id, active
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'toggle_subscription', 'subscription', $2, $3)
    `, [
      adminId,
      id,
      JSON.stringify({ active: result.rows[0].active })
    ]);
    
    console.log('✅ Subscription toggled:', id, 'active:', result.rows[0].active);
    
    res.json({
      success: true,
      subscription: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Toggle subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle subscription'
    });
  }
});

export default router;