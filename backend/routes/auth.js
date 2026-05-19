const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/database');
const { logAction } = require('./audit');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

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

// Login route with rate limiting
router.post('/login', authLimiter, async (req, res) => {
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

// Guest login - no password required
router.post('/guest', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE role = 'GUEST' LIMIT 1");
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Guest account not configured' });
    }
    
    const user = rows[0];
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

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

// Create Nodemailer transporter
const createTransporter = () => {
  // Use SendGrid SMTP if SENDGRID_API_KEY is provided
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Use custom SMTP if EMAIL_HOST is provided
  const emailHost = process.env.EMAIL_HOST;
  if (emailHost) {
    return nodemailer.createTransport({
      host: emailHost,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // Fallback to Gmail (requires EMAIL_USER and EMAIL_PASS)
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  // Check if email is configured with actual values
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASS || '';
  const emailHost = process.env.EMAIL_HOST;
  
  // Only skip if credentials are completely empty
  if (!emailUser || !emailPass) {
    console.log('\n========================================');
    console.log('⚠️  EMAIL NOT SENT - Configuration Missing');
    console.log('========================================');
    console.log('The system needs SMTP credentials to send emails.');
    console.log('User attempted reset for:', email);
    console.log('Reset token:', token);
    console.log('\nTo enable email sending, configure one of these options:');
    console.log('---------------------------------------------------');
    console.log('Option 1: SendGrid (Free - Recommended)');
    console.log('  1. Sign up: https://signup.sendgrid.com/');
    console.log('  2. Create API Key with "Mail Send" permission');
    console.log('  3. Add to .env:');
    console.log('     EMAIL_SERVICE=smtp');
    console.log('     EMAIL_HOST=smtp.sendgrid.net');
    console.log('     EMAIL_PORT=587');
    console.log('     EMAIL_SECURE=false');
    console.log('     EMAIL_USER=apikey');
    console.log('     EMAIL_PASS=your-sendgrid-api-key');
    console.log('');
    console.log('Option 2: Gmail (requires App Password)');
    console.log('  1. Enable 2FA on your Gmail');
    console.log('  2. Generate App Password: Google Account → Security → App passwords');
    console.log('  3. Add to .env:');
    console.log('     EMAIL_SERVICE=gmail');
    console.log('     EMAIL_USER=your-gmail@gmail.com');
    console.log('     EMAIL_PASS=your-16-digit-app-password');
    console.log('');
    console.log('Option 3: Custom SMTP server');
    console.log('  Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
    console.log('========================================\n');
    return;
  }
  
  console.log('\n📧 Attempting to send password reset email...');
  console.log('   To:', email);
  console.log('   Using:', emailHost ? `SMTP ${emailHost}:${process.env.EMAIL_PORT}` : process.env.EMAIL_SERVICE || 'gmail');
  
  const transporter = createTransporter();
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'SimTélécom Support <noreply@simtelecom.com>',
    to: email,
    subject: 'Password Reset Request - SimTélécom',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a8fff;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your SimTélécom account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #1a8fff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">SimTélécom Simulation & BI Analytics Platform</p>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   To:', email);
    console.log('');
  } catch (emailError) {
    console.error('❌ Failed to send email:');
    console.error('   Code:', emailError.code);
    console.error('   Message:', emailError.message);
    console.error('   To:', email);
    console.error('');
    
    // Provide helpful error messages based on error code
    if (emailError.code === 'EAUTH' || emailError.code === '535') {
      console.error('🔐 AUTHENTICATION FAILED - Check:');
      console.error('   1. API Key is correct (copy from SendGrid without extra spaces)');
      console.error('   2. API Key has "Mail Send" permission enabled');
      console.error('   3. Username is exactly: apikey');
      console.error('   4. EMAIL_PASS in .env matches your SendGrid API key exactly');
      console.error('\n📝 To fix:');
      console.error('   - Log into SendGrid → Settings → API Keys');
      console.error('   - Either: Use existing key with proper permissions');
      console.error('   - Or: Create new API key with "Full Access" or "Mail Send"');
      console.error('   - Update .env EMAIL_PASS with the new key');
    } else if (emailError.code === 'ESOCKET' || emailError.code === 'ECONNREFUSED') {
      console.error('🌐 CONNECTION FAILED - Check:');
      console.error('   EMAIL_HOST=smtp.sendgrid.net');
      console.error('   EMAIL_PORT=587');
      console.error('   EMAIL_SECURE=false');
    } else if (emailError.responseCode) {
      console.error('📨 SendGrid Response Code:', emailError.responseCode);
      console.error('   This usually means sender email not verified');
      console.error('   Go to SendGrid → Settings → Sender Authentication');
      console.error('   Verify EMAIL_FROM address: ' + process.env.EMAIL_FROM);
    }
    
    throw emailError;
  }
};

// Forgot password - request password reset
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const hash = await bcrypt.hash(token, 10);
      const expiry = new Date(Date.now() + 3600000); // 1 hour
      await db.query(
        'UPDATE users SET reset_token = ?, reset_expiry = ? WHERE user_id = ?',
        [hash, expiry, user.user_id]
      );
      // Audit log
      const ip_address = req.ip || req.connection.remoteAddress;
      await logAction({
        user_id: user.user_id,
        action: 'PASSWORD_RESET_REQUEST',
        entity: 'auth',
        ip_address,
        details: { email }
      });
      
      // Always try to send email
      try {
        await sendPasswordResetEmail(email, token);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError.message);
        // Continue anyway - don't fail the request if email fails
      }
      
      // In development mode, include token in response for testing
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.log('Password reset token for', email + ':', token);
        res.json({ 
          message: 'If the email exists, a reset link has been sent',
          resetToken: token, // Include token for development testing
          resetLink: 'http://localhost:5173/reset-password?token=' + token
        });
      } else {
        // Always return generic message to prevent email enumeration
        res.json({ message: 'If the email exists, a reset link has been sent' });
      }
    } else {
       // Always return success to prevent email enumeration
       res.json({ message: 'If the email exists, a reset link has been sent' });
     }
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 });

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE reset_token IS NOT NULL');
    let user = null;
    for (const row of rows) {
      const match = await bcrypt.compare(token, row.reset_token);
      if (match) {
        user = row;
        break;
      }
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (new Date() > new Date(user.reset_expiry)) {
      return res.status(400).json({ message: 'Token expired' });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE user_id = ?',
      [hash, user.user_id]
    );
    // Audit log
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id: user.user_id,
      action: 'PASSWORD_RESET',
      entity: 'auth',
      ip_address,
      details: {}
    });
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new account (creates GUEST accounts)
router.post('/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  if (username.length < 2 || username.length > 50) {
    return res.status(400).json({ message: 'Username must be between 2 and 50 characters' });
  }
  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [username, email, hash, 'GUEST']
    );
    // Audit log
    const ip_address = req.ip || req.connection.remoteAddress;
    await logAction({
      user_id: result.insertId,
      action: 'REGISTER',
      entity: 'user',
      entity_id: result.insertId,
      ip_address,
      details: { username, role: 'GUEST' }
    });
    res.status(201).json({ message: 'Account created successfully', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
