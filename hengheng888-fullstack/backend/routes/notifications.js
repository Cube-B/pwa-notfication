import express from 'express';
import webpush from 'web-push';
import { getDatabase } from '../database/db.js';

const router = express.Router();

// Get pool instance
const pool = getDatabase();

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    console.log('📤 Sending VAPID public key:', publicKey.substring(0, 20) + '...');
    res.json({ publicKey });
});

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription, userId } = req.body;
        
        console.log('📥 New subscription request');
        console.log('Endpoint:', subscription.endpoint);
        console.log('User ID:', userId || 'anonymous');
        
        const existingCheck = await pool.query(
            'SELECT id FROM push_subscriptions WHERE endpoint = $1',
            [subscription.endpoint]
        );

        if (existingCheck.rows.length > 0) {
            console.log('✅ Subscription already exists');
            return res.json({ 
                success: true, 
                message: 'Subscription already exists',
                subscriptionId: existingCheck.rows[0].id
            });
        }

        const result = await pool.query(
            `INSERT INTO push_subscriptions 
            (user_id, endpoint, p256dh, auth, created_at) 
            VALUES ($1, $2, $3, $4, NOW()) 
            RETURNING id`,
            [
                userId || null,
                subscription.endpoint,
                subscription.keys.p256dh,
                subscription.keys.auth
            ]
        );

        console.log('✅ Subscription saved with ID:', result.rows[0].id);

        res.json({ 
            success: true, 
            message: 'Subscription saved',
            subscriptionId: result.rows[0].id
        });

    } catch (error) {
        console.error('❌ Subscribe error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;
        
        console.log('🗑️ Unsubscribe request for:', endpoint);

        await pool.query(
            'DELETE FROM push_subscriptions WHERE endpoint = $1',
            [endpoint]
        );

        console.log('✅ Subscription deleted');
        res.json({ success: true, message: 'Unsubscribed successfully' });

    } catch (error) {
        console.error('❌ Unsubscribe error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send notification to all subscribers
router.post('/send', async (req, res) => {
    try {
        const { title, body, icon, badge, data } = req.body;

        console.log('\n📨 ===== SENDING NOTIFICATION =====');
        console.log('Title:', title);
        console.log('Body:', body);

        const result = await pool.query(
            'SELECT * FROM push_subscriptions ORDER BY created_at DESC'
        );

        const subscriptions = result.rows;
        console.log('📊 Found', subscriptions.length, 'subscription(s)');

        if (subscriptions.length === 0) {
            console.log('⚠️ No subscriptions found');
            return res.json({
                success: true,
                result: {
                    total: 0,
                    successful: 0,
                    failed: 0,
                    results: []
                }
            });
        }

        const payload = JSON.stringify({
            title: title || 'เฮงเฮง888',
            body: body || 'คุณมีการแจ้งเตือนใหม่',
            icon: icon || '/icon-192.png',
            badge: badge || '/icon-192.png',
            data: data || {}
        });

        console.log('📦 Payload:', payload);

        const sendPromises = subscriptions.map(async (sub, index) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            console.log(`\n🔄 [${index + 1}] Sending to:`, sub.endpoint.substring(0, 50) + '...');

            try {
                const response = await webpush.sendNotification(pushSubscription, payload);
                
                console.log(`✅ [${index + 1}] Success!`);
                console.log('Status:', response.statusCode);
                console.log('Headers:', response.headers);

                await pool.query(
                    `INSERT INTO notification_logs 
                    (subscription_id, title, body, status, sent_at) 
                    VALUES ($1, $2, $3, $4, NOW())`,
                    [sub.id, title, body, 'sent']
                );

                return { 
                    status: 'fulfilled', 
                    value: { 
                        success: true, 
                        subscriptionId: sub.id,
                        result: response 
                    } 
                };

            } catch (error) {
                console.error(`❌ [${index + 1}] Failed!`);
                console.error('Error:', error.message);
                console.error('Status Code:', error.statusCode);
                console.error('Headers:', error.headers);
                console.error('Body:', error.body);

                await pool.query(
                    `INSERT INTO notification_logs 
                    (subscription_id, title, body, status, error_message, sent_at) 
                    VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [sub.id, title, body, 'failed', error.message]
                );

                if (error.statusCode === 410) {
                    console.log(`🗑️ [${index + 1}] Subscription expired, deleting...`);
                    await pool.query(
                        'DELETE FROM push_subscriptions WHERE id = $1',
                        [sub.id]
                    );
                }

                return { 
                    status: 'rejected', 
                    reason: error.message,
                    subscriptionId: sub.id,
                    errorCode: error.statusCode
                };
            }
        });

        const results = await Promise.allSettled(sendPromises);

        const successful = results.filter(r => r.value?.status === 'fulfilled').length;
        const failed = results.filter(r => r.value?.status === 'rejected' || r.status === 'rejected').length;

        console.log('\n📊 ===== RESULTS =====');
        console.log('✅ Successful:', successful);
        console.log('❌ Failed:', failed);
        console.log('========================\n');

        res.json({
            success: true,
            result: {
                total: subscriptions.length,
                successful,
                failed,
                results
            }
        });

    } catch (error) {
        console.error('❌ Send notification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send test notification
router.post('/test', async (req, res) => {
    try {
        const { endpoint } = req.body;

        console.log('🧪 Test notification for:', endpoint);

        const result = await pool.query(
            'SELECT * FROM push_subscriptions WHERE endpoint = $1',
            [endpoint]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Subscription not found' 
            });
        }

        const sub = result.rows[0];
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        };

        const payload = JSON.stringify({
            title: '🧪 Test Notification',
            body: 'This is a test notification from เฮงเฮง888',
            icon: '/icon-192.png'
        });

        const response = await webpush.sendNotification(pushSubscription, payload);

        console.log('✅ Test notification sent successfully');
        res.json({ success: true, result: response });

    } catch (error) {
        console.error('❌ Test notification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const subscriptionsResult = await pool.query(
            'SELECT COUNT(*) as count FROM push_subscriptions'
        );
        
        const notificationsResult = await pool.query(
            'SELECT COUNT(*) as count FROM notification_logs'
        );

        const successResult = await pool.query(
            "SELECT COUNT(*) as count FROM notification_logs WHERE status = 'sent'"
        );

        const failedResult = await pool.query(
            "SELECT COUNT(*) as count FROM notification_logs WHERE status = 'failed'"
        );

        res.json({
            subscriptions: parseInt(subscriptionsResult.rows[0].count),
            notifications_sent: parseInt(notificationsResult.rows[0].count),
            successful: parseInt(successResult.rows[0].count),
            failed: parseInt(failedResult.rows[0].count)
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
