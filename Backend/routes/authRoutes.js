const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const otpStore = new Map();

const OTP_TTL_MS = 10 * 60 * 1000;
const ALLOWED_ROLES = new Set(['user', 'admin']);

const normalizeEmail = (email) => email.trim().toLowerCase();
const userKey = (email, role) => `${normalizeEmail(email)}:${role}`;
const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const DEFAULT_USERS = [
  {
    email: 'member@tasktracker.io',
    firstName: 'Team Member',
    role: 'user',
    passwordHash: hashPassword('password123'),
  },
  {
    email: 'admin@tasktracker.io',
    firstName: 'Admin',
    role: 'admin',
    passwordHash: hashPassword('admin123'),
  },
];

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

const requireEmailDelivery = () =>
  String(process.env.OTP_DEV_MODE || 'false').toLowerCase() !== 'true';

const saveUsers = (usersMap) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const payload = {
    users: Array.from(usersMap.values()),
  };
  fs.writeFileSync(USERS_FILE, JSON.stringify(payload, null, 2), 'utf8');
};

const ensureDefaultUsers = (usersMap) => {
  let changed = false;
  DEFAULT_USERS.forEach((user) => {
    const key = userKey(user.email, user.role);
    if (!usersMap.has(key)) {
      usersMap.set(key, {
        ...user,
        createdAt: new Date().toISOString(),
      });
      changed = true;
    }
  });
  if (changed) {
    saveUsers(usersMap);
  }
};

const loadUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const seeded = new Map();
      DEFAULT_USERS.forEach((user) => {
        seeded.set(userKey(user.email, user.role), {
          ...user,
          createdAt: new Date().toISOString(),
        });
      });
      saveUsers(seeded);
      return seeded;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.users) ? parsed.users : [];
    const map = new Map();
    list.forEach((user) => {
      if (user?.email) {
        const role = user.role || 'user';
        const normalizedEmail = normalizeEmail(user.email);
        map.set(userKey(normalizedEmail, role), {
          ...user,
          email: normalizedEmail,
          role,
        });
      }
    });
    ensureDefaultUsers(map);
    return map;
  } catch (error) {
    const fallback = new Map();
    DEFAULT_USERS.forEach((user) => {
      fallback.set(userKey(user.email, user.role), {
        ...user,
        createdAt: new Date().toISOString(),
      });
    });
    saveUsers(fallback);
    return fallback;
  }
};

const users = loadUsers();

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

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, password, firstName, role = 'user' } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const key = userKey(normalizedEmail, role);
    if (users.has(key)) {
      return res.status(409).json({ msg: 'Account already exists for this email.' });
    }

    users.set(key, {
      email: normalizedEmail,
      firstName,
      role,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);

    res.json({ ok: true, message: 'User created successfully.' });
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
    const user = users.get(userKey(normalizedEmail, role));
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
    const devMode = String(process.env.OTP_DEV_MODE || 'false').toLowerCase() === 'true';
    const mustSendEmail = requireEmailDelivery();
    if (mustSendEmail && !emailResult.sent) {
      return res.status(500).json({
        msg:
          emailResult.reason === 'Email not configured'
            ? 'Email delivery not configured. Set SMTP_* values in Backend/.env.'
            : 'Failed to send OTP email. Check SMTP settings.',
      });
    }
    const includeDevOtp = devMode && !emailResult.sent;

    res.json({
      otpSent: true,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      emailSent: emailResult.sent,
      devOtp: includeDevOtp ? otp : undefined,
    });
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
  (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, role = 'user', purpose = 'login', code } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = users.get(userKey(normalizedEmail, role));
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
    const user = users.get(userKey(normalizedEmail, role));
    if (!user) {
      return res.status(404).json({ msg: 'Account not found for this role.' });
    }

    const otp = issueOtp({ email: normalizedEmail, role, purpose: 'reset' });
    const emailResult = await sendOtpEmail({
      email: normalizedEmail,
      role,
      code: otp,
      purpose: 'reset',
    });
    const devMode = String(process.env.OTP_DEV_MODE || 'false').toLowerCase() === 'true';
    const mustSendEmail = requireEmailDelivery();
    if (mustSendEmail && !emailResult.sent) {
      return res.status(500).json({
        msg:
          emailResult.reason === 'Email not configured'
            ? 'Email delivery not configured. Set SMTP_* values in Backend/.env.'
            : 'Failed to send OTP email. Check SMTP settings.',
      });
    }
    const includeDevOtp = devMode && !emailResult.sent;

    res.json({
      otpSent: true,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      emailSent: emailResult.sent,
      devOtp: includeDevOtp ? otp : undefined,
    });
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
  (req, res) => {
    if (validationErrorResponse(req, res)) return;

    const { email, role = 'user', code, newPassword } = req.body;
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ msg: 'Unsupported role.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = users.get(userKey(normalizedEmail, role));
    if (!user) {
      return res.status(404).json({ msg: 'Account not found for this role.' });
    }

    const otpCheck = verifyOtp({ email: normalizedEmail, role, purpose: 'reset', code });
    if (!otpCheck.ok) {
      return res.status(401).json({ msg: otpCheck.message });
    }

    users.set(userKey(normalizedEmail, role), {
      ...user,
      passwordHash: hashPassword(newPassword),
      updatedAt: new Date().toISOString(),
    });
    saveUsers(users);

    res.json({ ok: true, message: 'Password updated successfully.' });
  }
);

module.exports = router;
