// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    👤 Create Admin User v2.0.0                                ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  user: 'privatoffy',
  host: 'localhost',
  database: '1klive_pwa_db',
  password: '',
  port: 5432,
});

async function createAdmin() {
  try {
    console.log('👤 Creating admin user...\n');
    
    const username = 'admin';
    const email = 'admin@1klive.com';
    const password = 'admin123';
    const fullName = 'Super Administrator';
    const role = 'super_admin';
    
    // Generate password hash
    console.log('🔧 Generating password hash...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Hash generated\n');
    
    // Delete existing admin (if any)
    console.log('🗑️  Deleting existing admin (if any)...');
    await pool.query('DELETE FROM admins WHERE username = $1', [username]);
    console.log('✅ Cleared\n');
    
    // Create new admin
    console.log('📝 Creating new admin...');
    const result = await pool.query(
      `INSERT INTO admins (username, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, username, email, full_name, role, is_active`,
      [username, email, passwordHash, fullName, role]
    );
    
    const admin = result.rows[0];
    
    console.log('✅ Admin created successfully!\n');
    console.log('👤 Admin Info:');
    console.log('   ID:', admin.id);
    console.log('   Username:', admin.username);
    console.log('   Email:', admin.email);
    console.log('   Full Name:', admin.full_name);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.is_active);
    
    console.log('\n🔐 Login Credentials:');
    console.log('   Username:', username);
    console.log('   Password:', password);
    console.log('\n⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
    
    // Test password
    console.log('\n🧪 Testing password...');
    const testResult = await bcrypt.compare(password, passwordHash);
    
    if (testResult) {
      console.log('✅ Password test successful!');
      console.log('\n🎉 Ready to login!');
      console.log('\nTest with:');
      console.log(`curl -X POST http://localhost:3000/api/admin/auth/login \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"username": "${username}", "password": "${password}"}'`);
    } else {
      console.log('❌ Password test failed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

createAdmin();
