// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    🛡️ Authentication Middleware v2.0.0                        ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import jwt from 'jsonwebtoken';
import { pool } from '../server.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// ========================================
// 🔐 Verify JWT Token
// ========================================
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if admin exists and is active
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, is_active FROM admins WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    const admin = result.rows[0];
    
    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Admin account is inactive'
      });
    }
    
    // Attach admin to request
    req.admin = admin;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// ========================================
// 👑 Check Role Permission
// ========================================
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// ========================================
// 📝 Log Activity
// ========================================
export const logActivity = (action, entityType = null) => {
  return async (req, res, next) => {
    try {
      if (req.admin) {
        await pool.query(
          `INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, details, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.admin.id,
            action,
            entityType,
            req.params.id || null,
            JSON.stringify({
              body: req.body,
              query: req.query
            }),
            req.ip,
            req.get('user-agent')
          ]
        );
      }
    } catch (error) {
      console.error('❌ Log activity error:', error);
    }
    next();
  };
};

export default {
  authMiddleware,
  requireRole,
  logActivity
};
