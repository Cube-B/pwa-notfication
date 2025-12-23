-- ╔════════════════════════════════════════════════════════════════╗
-- ║                                                                ║
-- ║    🔐 Admin Dashboard - Database Schema v2.0.0                ║
-- ║                                                                ║
-- ╚════════════════════════════════════════════════════════════════╝

-- ========================================
-- 📝 Admins Table
-- ========================================

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  created_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 🔑 Sessions Table (JWT tokens)
-- ========================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 📊 Notification Logs Table
-- ========================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  icon TEXT,
  badge TEXT,
  
  -- Targeting
  target_type VARCHAR(20) DEFAULT 'all' CHECK (target_type IN ('all', 'segment', 'single')),
  target_filter JSONB, -- e.g., {"carrier": "AIS", "device_type": "iOS"}
  
  -- Stats
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Timing
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'completed', 'failed', 'scheduled')),
  
  -- Metadata
  error_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 📋 Notification Templates
-- ========================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  icon TEXT,
  badge TEXT,
  category VARCHAR(50), -- e.g., 'promotion', 'announcement', 'alert'
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 📈 Activity Logs
-- ========================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id),
  action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'send_notification', 'create_admin', etc.
  entity_type VARCHAR(50), -- 'notification', 'admin', 'subscription', etc.
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 🎨 System Settings
-- ========================================

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by INTEGER REFERENCES admins(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 📊 Analytics Snapshots (for performance)
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  total_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  total_notifications_sent INTEGER DEFAULT 0,
  notification_success_rate DECIMAL(5,2),
  
  -- By Carrier
  carrier_breakdown JSONB, -- {"AIS": 100, "DTAC": 80, ...}
  
  -- By Device
  device_breakdown JSONB, -- {"iOS": 150, "Android": 130}
  
  -- By Location
  location_breakdown JSONB, -- {"Bangkok": 200, "Chiang Mai": 50}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(snapshot_date)
);

-- ========================================
-- 🔍 Indexes
-- ========================================

-- Admins
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON admin_sessions(expires_at);

-- Notification Logs
CREATE INDEX IF NOT EXISTS idx_notif_logs_admin_id ON notification_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notif_logs_scheduled_at ON notification_logs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notif_logs_created_at ON notification_logs(created_at);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_admin_id ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);

-- Analytics Snapshots
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date);

-- ========================================
-- 👤 Create Initial Super Admin
-- ========================================

-- Password: admin123 (MUST CHANGE AFTER FIRST LOGIN!)
-- Hashed with bcrypt
INSERT INTO admins (username, email, password_hash, full_name, role, is_active)
VALUES (
  'admin',
  'admin@1klive.com',
  '$2b$10$rBV2Ev/CfHHUJvZWVZ5P7.xQKQx6dMXGbU6h3EYmKF8L6M8B8LqGO', -- admin123
  'Super Administrator',
  'super_admin',
  true
)
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- ⚙️ Initial Settings
-- ========================================

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
  ('site_name', '"1klive Admin"', 'Dashboard site name'),
  ('notifications_per_page', '20', 'Number of notifications per page'),
  ('session_timeout_hours', '24', 'Admin session timeout in hours'),
  ('max_broadcast_size', '10000', 'Max recipients per broadcast'),
  ('enable_scheduling', 'true', 'Enable notification scheduling'),
  ('dark_mode_default', 'false', 'Default dark mode preference')
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- 📝 Comments
-- ========================================

COMMENT ON TABLE admins IS 'Admin users with role-based access';
COMMENT ON TABLE admin_sessions IS 'Active admin sessions with JWT tokens';
COMMENT ON TABLE notification_logs IS 'History of all sent notifications';
COMMENT ON TABLE notification_templates IS 'Reusable notification templates';
COMMENT ON TABLE activity_logs IS 'Audit log of admin actions';
COMMENT ON TABLE system_settings IS 'System-wide configuration';
COMMENT ON TABLE analytics_snapshots IS 'Daily analytics data for performance';

-- ========================================
-- 📊 Views for Quick Stats
-- ========================================

CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  -- Subscriptions
  (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
  (SELECT COUNT(*) FROM subscriptions WHERE active = true) as active_subscriptions,
  (SELECT COUNT(*) FROM subscriptions WHERE created_at >= CURRENT_DATE) as today_subscriptions,
  
  -- Notifications
  (SELECT COUNT(*) FROM notification_logs WHERE sent_at >= CURRENT_DATE) as today_notifications,
  (SELECT COUNT(*) FROM notification_logs WHERE status = 'completed') as total_sent,
  (SELECT SUM(success_count) FROM notification_logs) as total_success,
  (SELECT SUM(failed_count) FROM notification_logs) as total_failed,
  
  -- Carriers
  (SELECT COUNT(*) FROM subscriptions WHERE carrier = 'AIS' AND has_mobile_carrier = true) as ais_count,
  (SELECT COUNT(*) FROM subscriptions WHERE carrier = 'DTAC' AND has_mobile_carrier = true) as dtac_count,
  (SELECT COUNT(*) FROM subscriptions WHERE carrier = 'True' AND has_mobile_carrier = true) as true_count,
  
  -- Devices
  (SELECT COUNT(*) FROM subscriptions WHERE device_type = 'iOS') as ios_count,
  (SELECT COUNT(*) FROM subscriptions WHERE device_type = 'Android') as android_count;

-- ========================================
-- ✅ Verification
-- ========================================

SELECT 
  'admins' as table_name,
  COUNT(*) as row_count
FROM admins
UNION ALL
SELECT 'admin_sessions', COUNT(*) FROM admin_sessions
UNION ALL
SELECT 'notification_logs', COUNT(*) FROM notification_logs
UNION ALL
SELECT 'notification_templates', COUNT(*) FROM notification_templates
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings;

-- ========================================
-- 📋 Sample Queries
-- ========================================

/*
-- Get dashboard stats
SELECT * FROM admin_dashboard_stats;

-- Get recent notifications
SELECT 
  id,
  title,
  total_recipients,
  success_count,
  failed_count,
  status,
  created_at
FROM notification_logs
ORDER BY created_at DESC
LIMIT 10;

-- Get active admins
SELECT 
  id,
  username,
  full_name,
  role,
  last_login_at
FROM admins
WHERE is_active = true;

-- Get activity log
SELECT 
  a.username,
  al.action,
  al.details,
  al.created_at
FROM activity_logs al
JOIN admins a ON al.admin_id = a.id
ORDER BY al.created_at DESC
LIMIT 20;
*/
