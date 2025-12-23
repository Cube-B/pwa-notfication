// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    🔐 Admin Authentication Routes v2.0.0                      ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../server.js';

const router = express.Router();

// JWT Secret (ใน production ควรเก็บใน environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h';

// ========================================
// 🔐 Login
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Login attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }
    
    // Find admin
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin not found:', username);
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
    
    const admin = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      console.log('❌ Invalid password for:', username);
      
      // Log failed attempt
      await pool.query(
        `INSERT INTO activity_logs (admin_id, action, details, ip_address)
         VALUES ($1, 'login_failed', $2, $3)`,
        [
          admin.id,
          JSON.stringify({ username }),
          req.ip
        ]
      );
      
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Update last login
    await pool.query(
      `UPDATE admins 
       SET last_login_at = CURRENT_TIMESTAMP, 
           last_login_ip = $1
       WHERE id = $2`,
      [req.ip, admin.id]
    );
    
    // Save session
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await pool.query(
      `INSERT INTO admin_sessions (admin_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        admin.id,
        tokenHash,
        req.ip,
        req.get('user-agent'),
        expiresAt
      ]
    );
    
    // Log successful login
    await pool.query(
      `INSERT INTO activity_logs (admin_id, action, details, ip_address)
       VALUES ($1, 'login_success', $2, $3)`,
      [
        admin.id,
        JSON.stringify({ username }),
        req.ip
      ]
    );
    
    console.log('✅ Login successful:', username);
    
    // Return user info and token
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// ========================================
// 🔓 Logout
// ========================================
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Delete session
      await pool.query(
        'DELETE FROM admin_sessions WHERE admin_id = $1',
        [decoded.id]
      );
      
      // Log logout
      await pool.query(
        `INSERT INTO activity_logs (admin_id, action, ip_address)
         VALUES ($1, 'logout', $2)`,
        [decoded.id, req.ip]
      );
      
      console.log('✅ Logout successful:', decoded.username);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.json({
      success: true,
      message: 'Logged out'
    });
  }
});

// ========================================
// 👤 Get Current User
// ========================================
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get admin info
    const result = await pool.query(
      `SELECT id, username, email, full_name, role, last_login_at
       FROM admins 
       WHERE id = $1 AND is_active = true`,
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    res.json({
      success: true,
      admin: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// ========================================
// 🔄 Refresh Token
// ========================================
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Generate new token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token: newToken
    });
    
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// ========================================
// 🔐 Change Password
// ========================================
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }
    
    // Get admin
    const result = await pool.query(
      'SELECT * FROM admins WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    const admin = result.rows[0];
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, decoded.id]
    );
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (admin_id, action, ip_address)
       VALUES ($1, 'password_changed', $2)`,
      [decoded.id, req.ip]
    );
    
    console.log('✅ Password changed:', admin.username);
    
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

export default router;
export { JWT_SECRET };
