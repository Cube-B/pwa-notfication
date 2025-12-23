import pg from 'pg';
import fs from 'fs';
const pool = new pg.Pool({
  user: 'privatoffy',
  host: 'localhost',
  database: '1klive_pwa_db'
});
const sql = fs.readFileSync('migration_v2.1.0_pwa_config.sql', 'utf8');
await pool.query(sql);
console.log('✅ Done!');
await pool.end();