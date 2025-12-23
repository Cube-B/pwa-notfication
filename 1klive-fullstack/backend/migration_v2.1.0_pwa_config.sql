-- ╔════════════════════════════════════════════════════════════════╗
-- ║                                                                ║
-- ║    🎨 PWA Configuration System - Schema v2.1.0                ║
-- ║                                                                ║
-- ╚════════════════════════════════════════════════════════════════╝

-- ========================================
-- 🎨 PWA Configuration Table
-- ========================================

CREATE TABLE IF NOT EXISTS pwa_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by INTEGER REFERENCES admins(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 📊 Health Check Logs
-- ========================================

CREATE TABLE IF NOT EXISTS health_check_logs (
  id SERIAL PRIMARY KEY,
  target_url TEXT NOT NULL,
  is_accessible BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 📝 Insert Default PWA Configuration
-- ========================================

INSERT INTO pwa_config (config_key, config_value, description) VALUES

-- Branding
('site_name', '"1klive"', 'Site name shown in PWA'),
('site_title', '"ติดตั้ง 1klive"', 'Main title on install screen'),
('site_subtitle', '"แพลตฟอร์มสตรีมมิ่งสดระดับโลก"', 'Subtitle on install screen'),

-- Logo
('logo_url', '"https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp"', 'Logo URL'),
('logo_alt', '"1klive Logo"', 'Logo alt text'),

-- Background
('background_type', '"color"', 'Background type: color, image, gradient'),
('background_color', '"#1a1a2e"', 'Background color (hex)'),
('background_image', '"https://example.com/bg.jpg"', 'Background image URL (if type=image)'),
('background_gradient', '"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"', 'CSS gradient (if type=gradient)'),

-- Target URLs
('target_url', '"https://1klive.com/"', 'Primary target URL'),
('fallback_url', '"https://backup.1klive.com/"', 'Fallback URL if primary is down'),
('use_fallback', 'false', 'Enable fallback mechanism'),

-- Error Messages
('error_title', '"ไม่สามารถเข้าถึงได้"', 'Error screen title'),
('error_message', '"เว็บไซต์หลักไม่สามารถเข้าถึงได้ในขณะนี้ กรุณาใช้ลิงค์สำรองด้านล่าง"', 'Error screen message'),
('error_button_text', '"เปิดเว็บสำรอง"', 'Error screen button text'),

-- Install Screen Messages
('install_title', '"ติดตั้ง 1klive"', 'Install screen title'),
('install_subtitle', '"แพลตฟอร์มสตรีมมิ่งสดระดับโลก"', 'Install screen subtitle'),
('install_button_text', '"ติดตั้งเลย"', 'Install button text'),
('install_cancel_text', '"ยกเลิก"', 'Install cancel button text'),

-- Permission Screen Messages
('permission_title', '"เปิดการแจ้งเตือน"', 'Permission screen title'),
('permission_message', '"รับการแจ้งเตือนโปรโมชั่นและข่าวสารพิเศษจากเราทันที"', 'Permission screen message'),
('permission_button_text', '"เปิดการแจ้งเตือน"', 'Permission allow button text'),
('permission_skip_text', '"ข้าม"', 'Permission skip button text'),

-- Features List
('features', '[
  {"icon": "📺", "text": "รับชมสดตลอด 24 ชั่วโมง"},
  {"icon": "🔔", "text": "แจ้งเตือนโปรโมชั่นพิเศษ"},
  {"icon": "⚡", "text": "เข้าถึงรวดเร็ว ไม่ต้องเปิดเบราว์เซอร์"},
  {"icon": "🎁", "text": "รับสิทธิพิเศษเฉพาะสมาชิก"}
]', 'List of features to show on install screen'),

-- Health Check Settings
('health_check_enabled', 'true', 'Enable automatic health checks'),
('health_check_interval_minutes', '5', 'Health check interval in minutes'),
('health_check_timeout_ms', '5000', 'Health check timeout in milliseconds'),

-- Theme Settings
('primary_color', '"#667eea"', 'Primary theme color'),
('secondary_color', '"#764ba2"', 'Secondary theme color'),
('text_color', '"#ffffff"', 'Text color'),
('button_color', '"#667eea"', 'Button color'),
('button_text_color', '"#ffffff"', 'Button text color')

ON CONFLICT (config_key) DO NOTHING;

-- ========================================
-- 🔍 Indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_pwa_config_key ON pwa_config(config_key);
CREATE INDEX IF NOT EXISTS idx_health_check_checked_at ON health_check_logs(checked_at);
CREATE INDEX IF NOT EXISTS idx_health_check_url ON health_check_logs(target_url);

-- ========================================
-- 📊 View for Current PWA Config
-- ========================================

CREATE OR REPLACE VIEW current_pwa_config AS
SELECT 
  config_key,
  config_value,
  description,
  updated_at
FROM pwa_config
ORDER BY config_key;

-- ========================================
-- 📊 View for Latest Health Checks
-- ========================================

CREATE OR REPLACE VIEW latest_health_checks AS
SELECT DISTINCT ON (target_url)
  target_url,
  is_accessible,
  response_time_ms,
  error_message,
  checked_at
FROM health_check_logs
ORDER BY target_url, checked_at DESC;

-- ========================================
-- 📝 Comments
-- ========================================

COMMENT ON TABLE pwa_config IS 'PWA configuration settings (logo, colors, texts, URLs)';
COMMENT ON TABLE health_check_logs IS 'Health check history for target URLs';

-- ========================================
-- ✅ Verification
-- ========================================

SELECT 
  'pwa_config' as table_name,
  COUNT(*) as settings_count
FROM pwa_config
UNION ALL
SELECT 
  'health_check_logs',
  COUNT(*)
FROM health_check_logs;

-- Show all config
SELECT 
  config_key,
  config_value::text as value,
  updated_at
FROM pwa_config
ORDER BY config_key;
