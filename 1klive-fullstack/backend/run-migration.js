// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    🔄 Database Migration Runner v2.0.0                        ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: 'privatoffy',
  host: 'localhost',
  database: '1klive_pwa_db',
  password: '', // Add if needed
  port: 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration...');
    
    const sqlFile = path.join(__dirname, 'migration_v2.0.0_admin_dashboard.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('admins', 'admin_sessions', 'notification_logs', 'notification_templates', 'activity_logs', 'system_settings')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log('  ✅', row.table_name);
    });
    
    // Check initial admin
    const adminCheck = await client.query('SELECT username, email, role FROM admins');
    console.log('\n👤 Admin users:');
    adminCheck.rows.forEach(admin => {
      console.log(`  ✅ ${admin.username} (${admin.email}) - ${admin.role}`);
    });
    
    console.log('\n🔐 Default Login:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
