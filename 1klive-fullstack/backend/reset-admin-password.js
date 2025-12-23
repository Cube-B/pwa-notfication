// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    🔐 Reset Admin Password v2.0.0                             ║
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

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');
    
    const username = 'admin';
    const newPassword = 'admin123';
    
    // Generate new hash with bcryptjs
    console.log('🔧 Generating password hash...');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('✅ Hash generated:', passwordHash.substring(0, 30) + '...');
    
    // Update password
    console.log('\n📝 Updating database...');
    const result = await pool.query(
      'UPDATE admins SET password_hash = $1 WHERE username = $2 RETURNING id, username, email, role',
      [passwordHash, username]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('💡 Run migration first: node run-migration.js');
    } else {
      const admin = result.rows[0];
      console.log('✅ Password updated successfully!');
      console.log('\n👤 Admin Info:');
      console.log('   ID:', admin.id);
      console.log('   Username:', admin.username);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      
      console.log('\n🔐 Login Credentials:');
      console.log('   Username:', username);
      console.log('   Password:', newPassword);
      
      // Test the password
      console.log('\n🧪 Testing password...');
      const testResult = await bcrypt.compare(newPassword, passwordHash);
      
      if (testResult) {
        console.log('✅ Password test successful!');
      } else {
        console.log('❌ Password test failed!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
