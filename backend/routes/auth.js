const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { logAction } = require('./audit');
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
 *           description: The auto-generated ID of the user
 *         username:
 *           type: string
 *           description: Login username
 *         email:
 *           type: string
 *           description: User email
 *         role:
 *           type: string
 *           enum: [ADMIN, ANALYST]
 *           description: User role
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         user:
 *           type: object
 *           properties:
 *             user_id:
 *               type: integer
 *             username:
 *               type: string
 *             role:
 *               type: string
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags: [Authentication]
 *     description: "EN: Login with email and password - FR: Connexion avec email et mot de passe"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Audit log failed login
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id: null,
        action: 'LOGIN_FAILED',
        entity: 'auth',
        ip_address,
        details: { email, reason: 'user_not_found' }
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Audit log failed login
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id: user.user_id,
        action: 'LOGIN_FAILED',
        entity: 'auth',
        ip_address,
        details: { email, username: user.username, reason: 'invalid_password' }
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Audit log successful login
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id: user.user_id,
      action: 'LOGIN',
      entity: 'auth',
      ip_address,
      details: { username: user.username, role: user.role }
    });

    res.json({
      token,
      user: { user_id: user.user_id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Not authenticated
 */
router.get('/me', (req, res) => {
  // The authMiddleware already attached user info to req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
   res.json({ user_id: req.user.user_id, role: req.user.role });
});

module.exports = router;
