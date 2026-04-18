const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { logAction } = require('./audit');
const { requireAdmin, requireAuth } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, ANALYST, GUEST]
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role, created_at, updated_at FROM users ORDER BY user_id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get single user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role, created_at, updated_at FROM users WHERE user_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ANALYST, GUEST]
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', requireAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (!['ADMIN', 'ANALYST', 'GUEST'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    // Check if email exists
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [username, email, hash, role]
    );
    
    // Audit log
    await logAction({
      user_id: req.user.user_id,
      action: 'CREATE',
      entity: 'user',
      entity_id: result.insertId,
      ip_address: req.ip,
      details: { username, role }
    });
    
    res.status(201).json({ message: 'User created successfully', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const updates = [];
    const params = [];
    
    if (username) { updates.push('username = ?'); params.push(username); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(hash);
    }
    if (role) {
      if (!['ADMIN', 'ANALYST', 'GUEST'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      updates.push('role = ?');
      params.push(role);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    params.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = ?`, params);
    
    // Audit log
    await logAction({
      user_id: req.user.user_id,
      action: 'UPDATE',
      entity: 'user',
      entity_id: parseInt(id),
      ip_address: req.ip,
      details: { username, role }
    });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Prevent deleting self
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    
    // Audit log
    await logAction({
      user_id: req.user.user_id,
      action: 'DELETE',
      entity: 'user',
      entity_id: parseInt(id),
      ip_address: req.ip,
      details: {}
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;