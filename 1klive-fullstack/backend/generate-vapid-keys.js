#!/usr/bin/env node

/**
 * 1klive - VAPID Key Generator
 * 
 * This script generates VAPID keys for Web Push notifications.
 * Run this once during initial setup.
 */

import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('');
console.log('🔑 ====================================');
console.log('🔑 1klive VAPID Key Generator');
console.log('🔑 ====================================');
console.log('');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys generated successfully!');
console.log('');
console.log('📋 Copy these keys to your .env file:');
console.log('');
console.log('─────────────────────────────────────');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('');
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('─────────────────────────────────────');
console.log('');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found');
  console.log('');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env from .env.example...');
    
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Replace placeholder keys
    envContent = envContent.replace(
      /VAPID_PUBLIC_KEY=.*/,
      'VAPID_PUBLIC_KEY=' + vapidKeys.publicKey
    );
    envContent = envContent.replace(
      /VAPID_PRIVATE_KEY=.*/,
      'VAPID_PRIVATE_KEY=' + vapidKeys.privateKey
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file created with VAPID keys!');
    console.log('');
    console.log('⚠️  Please update the following in .env:');
    console.log('   - DB_PASSWORD (your PostgreSQL password)');
    console.log('   - VAPID_EMAIL (your email)');
    console.log('');
  } else {
    console.log('❌ .env.example not found');
    console.log('   Please create .env manually');
    console.log('');
  }
} else {
  console.log('✅ .env file exists');
  console.log('');
  console.log('💡 To update VAPID keys:');
  console.log('   1. Open .env file');
  console.log('   2. Replace VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY');
  console.log('   3. Save and restart server');
  console.log('');
}

console.log('🔐 Important Security Notes:');
console.log('   - Keep these keys SECRET');
console.log('   - Do NOT commit .env to git');
console.log('   - Generate new keys for production');
console.log('   - Store keys securely in production');
console.log('');
console.log('====================================');
console.log('');
