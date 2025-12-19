import express from 'express';
import { db } from '../database/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }

        const existingUser = db.getUserByUsername(username);
        if (existingUser) {
            return res.json({ 
                success: true,
                userId: existingUser.id,
                user: { id: existingUser.id, username: existingUser.username }
            });
        }

        const result = db.createUser(username, null, null);
        res.json({ 
            success: true,
            userId: result.lastInsertRowid,
            user: { id: result.lastInsertRowid, username }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const user = db.getUserById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password_hash, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
