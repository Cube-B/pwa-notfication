// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    👥 Admin Management Routes v2.0.0                          ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All admin management routes require authentication
router.use(authMiddleware);

// ========================================
// 📋 Get All Admins
// ========================================
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all admins...');
    
    const result = await pool.query(`
      SELECT 
        id, username, email, full_name, role,
        active, last_login_at, created_at
      FROM admins
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      admins: result.rows
    });
    
  } catch (error) {
    console.error('❌ Get admins error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admins'
    });
  }
});

// ========================================
// 👤 Get Single Admin
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('👤 Fetching admin:', id);
    
    const result = await pool.query(`
      SELECT 
        id, username, email, full_name, role,
        active, last_login_at, created_at
      FROM admins
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      admin: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Get admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin'
    });
  }
});

// ========================================
// ➕ Create Admin (Super Admin Only)
// ========================================
router.post('/', async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    const currentAdmin = req.user;
    
    console.log('➕ Creating admin:', username);
    
    // Only super_admin can create admins
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only super admins can create new admins'
      });
    }
    
    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password, and role are required'
      });
    }
    
    // Validate role
    const validRoles = ['super_admin', 'admin', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be: super_admin, admin, or viewer'
      });
    }
    
    // Check if username exists
    const existingUser = await pool.query(
      `SELECT id FROM admins WHERE username = $1`,
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }
    
    // Check if email exists
    const existingEmail = await pool.query(
      `SELECT id FROM admins WHERE email = $1`,
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin
    const result = await pool.query(`
      INSERT INTO admins 
        (username, email, password_hash, full_name, role, active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, username, email, full_name, role, active, created_at
    `, [username, email, hashedPassword, full_name, role]);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'create_admin', 'admin', $2, $3)
    `, [
      currentAdmin.id,
      result.rows[0].id,
      JSON.stringify({ username, role })
    ]);
    
    console.log('✅ Admin created:', result.rows[0].id);
    
    res.json({
      success: true,
      admin: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Create admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin'
    });
  }
});

// ========================================
// ✏️ Update Admin (Super Admin Only)
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, role, active } = req.body;
    const currentAdmin = req.user;
    
    console.log('✏️ Updating admin:', id);
    
    // Only super_admin can update admins
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only super admins can update admins'
      });
    }
    
    // Can't update yourself
    if (parseInt(id) === currentAdmin.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update your own account here. Use profile settings.'
      });
    }
    
    // Validate role if provided
    if (role) {
      const validRoles = ['super_admin', 'admin', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }
    }
    
    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }
    
    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }
    
    if (active !== undefined) {
      updates.push(`active = $${paramCount}`);
      values.push(active);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    values.push(id);
    
    const result = await pool.query(`
      UPDATE admins 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, full_name, role, active, created_at
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'update_admin', 'admin', $2, $3)
    `, [
      currentAdmin.id,
      id,
      JSON.stringify({ email, full_name, role, active })
    ]);
    
    console.log('✅ Admin updated:', id);
    
    res.json({
      success: true,
      admin: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Update admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update admin'
    });
  }
});

// ========================================
// 🔑 Change Admin Password (Super Admin Only)
// ========================================
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    const currentAdmin = req.user;
    
    console.log('🔑 Changing password for admin:', id);
    
    // Only super_admin can change other admin passwords
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only super admins can change admin passwords'
      });
    }
    
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    const result = await pool.query(`
      UPDATE admins 
      SET password_hash = $1
      WHERE id = $2
      RETURNING id, username
    `, [hashedPassword, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'change_password', 'admin', $2, $3)
    `, [
      currentAdmin.id,
      id,
      JSON.stringify({ username: result.rows[0].username })
    ]);
    
    console.log('✅ Password changed for admin:', id);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// ========================================
// 🗑️ Delete Admin (Super Admin Only)
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdmin = req.user;
    
    console.log('🗑️ Deleting admin:', id);
    
    // Only super_admin can delete admins
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only super admins can delete admins'
      });
    }
    
    // Can't delete yourself
    if (parseInt(id) === currentAdmin.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    
    // Get admin info before deleting
    const adminInfo = await pool.query(
      `SELECT username FROM admins WHERE id = $1`,
      [id]
    );
    
    if (adminInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    // Delete admin
    await pool.query(`DELETE FROM admins WHERE id = $1`, [id]);
    
    // Log activity
    await pool.query(`
      INSERT INTO activity_logs 
        (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, 'delete_admin', 'admin', $2, $3)
    `, [
      currentAdmin.id,
      id,
      JSON.stringify({ username: adminInfo.rows[0].username })
    ]);
    
    console.log('✅ Admin deleted:', id);
    
    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete admin'
    });
  }
});

// ========================================
// 📊 Get Admin Statistics
// ========================================
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewers,
        COUNT(CASE WHEN active = true THEN 1 END) as active,
        COUNT(CASE WHEN active = false THEN 1 END) as inactive
      FROM admins
    `);
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin stats'
    });
  }
});

export default router;