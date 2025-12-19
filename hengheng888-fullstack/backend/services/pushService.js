// โหลด dotenv ก่อนอย่างอื่น!
import { config } from 'dotenv';
config();

import webpush from 'web-push';
import { db } from '../database/db.js';

// อ่าน keys จาก environment
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

// ตรวจสอบ keys
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.error('❌ VAPID keys not found in environment!');
    console.error('');
    console.error('Current environment variables:');
    console.error('VAPID_PUBLIC_KEY:', process.env.VAPID_PUBLIC_KEY ? 'EXISTS' : 'MISSING');
    console.error('VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY ? 'EXISTS' : 'MISSING');
    console.error('');
    console.error('Please check .env file');
    process.exit(1);
}

console.log('✅ VAPID keys loaded successfully');
console.log('🔑 Public Key:', vapidKeys.publicKey.substring(0, 30) + '...');

webpush.setVapidDetails(
    'mailto:support@hengheng888.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

class PushNotificationService {
    getPublicKey() {
        return vapidKeys.publicKey;
    }

    async saveSubscription(subscription, userId = null, userAgent = null) {
        try {
            const result = await db.saveSubscription(userId, subscription, userAgent);
            console.log('✅ Subscription saved');
            return result;
        } catch (error) {
            console.error('❌ Save subscription error:', error.message);
            throw error;
        }
    }

    async sendNotification(subscription, notification) {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        const payload = JSON.stringify({
            title: notification.title || 'เฮงเฮง888',
            body: notification.body || 'คุณมีการแจ้งเตือนใหม่',
            icon: notification.icon || '/logo.png',
            badge: notification.badge || '/logo.png',
            timestamp: Date.now()
        });

        try {
            const result = await webpush.sendNotification(pushSubscription, payload);
            await db.updateSubscriptionLastUsed(subscription.endpoint);
            await db.logNotification(subscription.id, notification, 'sent');
            console.log('✅ Notification sent successfully');
            return { success: true, result };
        } catch (error) {
            console.error('❌ Send notification error:', error.message);
            await db.logNotification(subscription.id, notification, 'failed');
            
            if (error.statusCode === 410) {
                console.log('🗑️ Removing expired subscription');
                await db.deleteSubscription(subscription.endpoint);
            }
            
            return { success: false, error: error.message };
        }
    }

    async sendToAll(notification) {
        const subscriptions = await db.getAllSubscriptions();
        console.log(`📤 Sending notification to ${subscriptions.length} subscription(s)`);

        if (subscriptions.length === 0) {
            console.log('⚠️ No subscriptions found');
            return { total: 0, successful: 0, failed: 0 };
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub => this.sendNotification(sub, notification))
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        console.log(`✅ Successful: ${successful}, ❌ Failed: ${failed}`);

        return { 
            total: results.length, 
            successful, 
            failed,
            results 
        };
    }

    async sendToUser(userId, notification) {
        const subscriptions = await db.getUserSubscriptions(userId);
        
        if (subscriptions.length === 0) {
            console.log(`⚠️ No subscriptions found for user ${userId}`);
            return { total: 0, successful: 0, failed: 0 };
        }

        console.log(`📤 Sending to user ${userId} (${subscriptions.length} device(s))`);

        const results = await Promise.allSettled(
            subscriptions.map(sub => this.sendNotification(sub, notification))
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        return { 
            total: results.length, 
            successful, 
            failed 
        };
    }

    async removeSubscription(endpoint) {
        try {
            await db.deleteSubscription(endpoint);
            console.log('🗑️ Subscription removed');
            return { success: true };
        } catch (error) {
            console.error('❌ Remove subscription error:', error.message);
            throw error;
        }
    }

    async getAllSubscriptions() {
        return await db.getAllSubscriptions();
    }

    async getNotificationLogs(limit = 100) {
        return await db.getNotificationLogs(limit);
    }
}

const pushService = new PushNotificationService();
export default pushService;
