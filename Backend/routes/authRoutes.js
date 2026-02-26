const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const otpStore = new Map();

const OTP_TTL_MS = 10 * 60 * 1000;
const ALLOWED_ROLES = new Set(['user', 'admin']);

const normalizeEmail = (email) => email.trim().toLowerCase();
const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

let cachedTransporter;

const getTransporter = () => {
  if (cachedTransporter !== undefined) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
};

const sendOtpEmail = async ({ email, role, code, purpose }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: 'Email not configured' };
  }

  const from =
    process.env.FROM_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'no-reply@tasktracker.local';

  const subject =
    purpose === 'reset'
      ? 'Reset your Task Tracker password'
      : 'Your Task Tracker sign-in code';

  const text = `Your ${role} OTP is ${code}. It expires in 10 minutes.`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
    });
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: 'Email send failed' };
  }
};

const isDevMode = () =>
  String(process.env.OTP_DEV_MODE || 'true').toLowerCase() === 'true';

const issueOtp = ({ email, role, purpose }) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const key = `${normalizeEmail(email)}:${role}:${purpose}`;
  otpStore.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return code;
};

const verifyOtp = ({ email, role, purpose, code }) => {
  const key = `${normalizeEmail(email)}:${role}:${purpose}`;
  const record = otpStore.get(key);
  if (!record) {
    return { ok: false, message: 'No OTP requested for this account.' };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { ok: false, message: 'OTP expired. Please request a new one.' };
  }
  if (record.code !== code) {
    return { ok: false, message: 'Invalid OTP. Please try again.' };
  }
  otpStore.delete(key);
  return { ok: true };
};

const validationErrorResponse = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// Signup route
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  async (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, password, firstName, role = 'user' } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      
      const existingUser = await User.findOne({
        where: { email: normalizedEmail },
      });
      
      if (existingUser) {
        return res.status(409).json({ msg: 'Account already exists for this email.' });
      }

      
      await User.create({
        email: normalizedEmail,
        firstName,
        role,
        passwordHash: hashPassword(password),
      });

      res.json({ ok: true, message: 'User created successfully.' });
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ msg: 'Account already exists for this email.' });
      }
      if (error?.name === 'SequelizeValidationError') {
        return res.status(400).json({ msg: 'Invalid account details.' });
      }
      console.error('Signup error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);


router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  async (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, password, role = 'user' } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      const user = await User.findOne({ 
        where: { email: normalizedEmail, role } 
      });
      
      if (!user) {
        return res.status(401).json({ msg: 'Account not found for this role.' });
      }

      const isMatch = user.passwordHash === hashPassword(password);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Invalid credentials.' });
      }

      const otp = issueOtp({ email: normalizedEmail, role, purpose: 'login' });
      const emailResult = await sendOtpEmail({
        email: normalizedEmail,
        role,
        code: otp,
        purpose: 'login',
      });
      const devMode = isDevMode();
      const includeDevOtp = !emailResult.sent || devMode;

      res.json({
        otpSent: true,
        expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
        emailSent: emailResult.sent,
        devOtp: includeDevOtp ? otp : undefined,
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);


router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must be numeric'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
    body('purpose').optional().isIn(['login', 'reset']).withMessage('Invalid OTP purpose'),
  ],
  async (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, role = 'user', purpose = 'login', code } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      const user = await User.findOne({ 
        where: { email: normalizedEmail, role } 
      });
      
      if (!user) {
        return res.status(401).json({ msg: 'Account not found for this role.' });
      }

      const otpCheck = verifyOtp({ email: normalizedEmail, role, purpose, code });
      if (!otpCheck.ok) {
        return res.status(401).json({ msg: otpCheck.message });
      }

      const secret = process.env.JWT_SECRET || 'dev-secret';
      const token = jwt.sign(
        { user: { email: normalizedEmail, role } },
        secret,
        { expiresIn: '2h' }
      );

      res.json({
        token,
        user: {
          email: normalizedEmail,
          firstName: user.firstName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);


router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  async (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, role = 'user' } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      const user = await User.findOne({ 
        where: { email: normalizedEmail, role } 
      });
      
      if (!user) {
        
        return res.json({ 
          otpSent: true, 
          expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
          emailSent: false,
        });
      }

      const otp = issueOtp({ email: normalizedEmail, role, purpose: 'reset' });
      const emailResult = await sendOtpEmail({
        email: normalizedEmail,
        role,
        code: otp,
        purpose: 'reset',
      });
      const devMode = isDevMode();
      const includeDevOtp = !emailResult.sent || devMode;

      res.json({
        otpSent: true,
        expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
        emailSent: emailResult.sent,
        devOtp: includeDevOtp ? otp : undefined,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);


router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must be numeric'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, role = 'user', code, newPassword } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      const user = await User.findOne({ 
        where: { email: normalizedEmail, role } 
      });
      
      if (!user) {
        return res.status(404).json({ msg: 'Account not found for this role.' });
      }

      const otpCheck = verifyOtp({ email: normalizedEmail, role, purpose: 'reset', code });
      if (!otpCheck.ok) {
        return res.status(401).json({ msg: otpCheck.message });
      }

      user.passwordHash = hashPassword(newPassword);
      await user.save();

      res.json({ ok: true, message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

module.exports = router;
