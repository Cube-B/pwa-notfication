import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool;

export function getDatabase() {
    if (!pool) {
        // Option 1: ใช้ DATABASE_URL
        const dbUrl = process.env.DATABASE_URL;
        
        // Option 2: ใช้ individual env vars (แบบเดิม)
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'privatoffy',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hengheng888'
        };
        
        console.log('🔍 Database Configuration:');
        
        // ลองใช้ DATABASE_URL ก่อน
        if (dbUrl) {
            console.log('   Using DATABASE_URL');
            pool = new Pool({
                connectionString: dbUrl,
                ssl: false
            });
        } else {
            // ถ้าไม่มี ใช้ individual env vars
            console.log('   Using individual DB env vars:');
            console.log('   DB_HOST:', dbConfig.host);
            console.log('   DB_PORT:', dbConfig.port);
            console.log('   DB_USER:', dbConfig.user);
            console.log('   DB_NAME:', dbConfig.database);
            
            pool = new Pool(dbConfig);
        }
    }
    return pool;
}

export async function initDatabase() {
    try {
        const db = getDatabase();

        // Test connection
        await db.query('SELECT NOW()');
        console.log('✅ PostgreSQL connected');

        // Users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Push subscriptions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                endpoint TEXT UNIQUE NOT NULL,
                p256dh TEXT NOT NULL,
                auth TEXT NOT NULL,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Notification logs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notification_logs (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER REFERENCES push_subscriptions(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                icon TEXT,
                status TEXT DEFAULT 'sent',
                error_message TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables created');
        return db;
    } catch (error) {
        console.error('❌ Database error:', error.message);
        throw error;
    }
}

export const db = {
    async createUser(username, email, passwordHash) {
        const client = getDatabase();
        const result = await client.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, passwordHash]
        );
        return { lastInsertRowid: result.rows[0].id };
    },

    async getUserByUsername(username) {
        const client = getDatabase();
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    async getUserById(id) {
        const client = getDatabase();
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    async saveSubscription(userId, subscription, userAgent) {
        const client = getDatabase();
        const result = await client.query(`
            INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, last_used) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (endpoint) 
            DO UPDATE SET user_id = $1, p256dh = $3, auth = $4, user_agent = $5, last_used = CURRENT_TIMESTAMP
            RETURNING id
        `, [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, userAgent]);
        return { lastInsertRowid: result.rows[0].id };
    },

    async getSubscription(endpoint) {
        const client = getDatabase();
        const result = await client.query('SELECT * FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
        return result.rows[0];
    },

    async getAllSubscriptions() {
        const client = getDatabase();
        const result = await client.query('SELECT * FROM push_subscriptions');
        return result.rows;
    },

    async getUserSubscriptions(userId) {
        const client = getDatabase();
        const result = await client.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [userId]);
        return result.rows;
    },

    async deleteSubscription(endpoint) {
        const client = getDatabase();
        await client.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    },

    async updateSubscriptionLastUsed(endpoint) {
        const client = getDatabase();
        await client.query(
            'UPDATE push_subscriptions SET last_used = CURRENT_TIMESTAMP WHERE endpoint = $1',
            [endpoint]
        );
    },

    async logNotification(subscriptionId, notification, status) {
        const client = getDatabase();
        await client.query(`
            INSERT INTO notification_logs (subscription_id, title, body, icon, status) 
            VALUES ($1, $2, $3, $4, $5)
        `, [subscriptionId, notification.title, notification.body, notification.icon, status]);
    },

    async getNotificationLogs(limit = 100) {
        const client = getDatabase();
        const result = await client.query('SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT $1', [limit]);
        return result.rows;
    }
};

export default db;
