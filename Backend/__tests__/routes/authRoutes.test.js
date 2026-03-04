const request = require('supertest');
const express = require('express');
const { sequelize } = require('../../config/db.test');
const User = require('../../models/User');
const authRoutes = require('../../routes/authRoutes');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
let server;
let api;

// Mock JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.OTP_DEV_MODE = 'true';

describe('Auth Routes', () => {
  beforeAll(async () => {
    server = await new Promise((resolve, reject) => {
      const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
      instance.on('error', reject);
    });
    api = request(server);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await api
        .post('/api/auth/signup')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          firstName: 'New User',
          role: 'user',
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toBe('User created successfully.');
    });

    it('should reject duplicate email', async () => {
      await User.create({
        email: 'duplicate@test.com',
        firstName: 'First User',
        role: 'user',
        passwordHash: User.hashPassword('password123'),
      });

      const response = await api
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          firstName: 'Second User',
          role: 'user',
        });

      expect(response.status).toBe(409);
      expect(response.body.msg).toBe('Account already exists for this email.');
    });

    it('should reject invalid email', async () => {
      const response = await api
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test User',
        });

      expect(response.status).toBe(400);
    });

    it('should reject short password', async () => {
      const response = await api
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: '123',
          firstName: 'Test User',
        });

      expect(response.status).toBe(400);
    });

    it('should reject empty firstName', async () => {
      const response = await api
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: '',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid role', async () => {
      const response = await api
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test User',
          role: 'superadmin',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      await User.create({
        email: 'signin@test.com',
        firstName: 'Signin User',
        role: 'user',
        passwordHash: User.hashPassword('password123'),
      });
    });

    it('should return OTP for valid credentials', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: 'signin@test.com',
          password: 'password123',
          role: 'user',
        });

      expect(response.status).toBe(200);
      expect(response.body.otpSent).toBe(true);
      expect(response.body.devOtp).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: 'signin@test.com',
          password: 'wrongpassword',
          role: 'user',
        });

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Invalid credentials.');
    });

    it('should reject non-existent user', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
          role: 'user',
        });

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Account not found for this role.');
    });

    it('should reject invalid email', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let user;
    let otp;

    beforeEach(async () => {
      await User.destroy({ where: {} });
      user = await User.create({
        email: 'verify@test.com',
        firstName: 'Verify User',
        role: 'user',
        passwordHash: User.hashPassword('password123'),
      });

      // Generate OTP
      otp = String(Math.floor(100000 + Math.random() * 900000));
    });

    it('should verify valid OTP and return token', async () => {
      // First sign in to get OTP
      const signinResponse = await api
        .post('/api/auth/signin')
        .send({
          email: 'verify@test.com',
          password: 'password123',
          role: 'user',
        });

      const validOtp = signinResponse.body.devOtp;

      const response = await api
        .post('/api/auth/verify-otp')
        .send({
          email: 'verify@test.com',
          code: validOtp,
          role: 'user',
          purpose: 'login',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid OTP', async () => {
      const response = await api
        .post('/api/auth/verify-otp')
        .send({
          email: 'verify@test.com',
          code: '000000',
          role: 'user',
          purpose: 'login',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success even for non-existent user (security)', async () => {
      const response = await api
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
          role: 'user',
        });

      expect(response.status).toBe(200);
      expect(response.body.otpSent).toBe(true);
    });

    it('should send OTP for existing user', async () => {
      await User.create({
        email: 'forgot@test.com',
        firstName: 'Forgot User',
        role: 'user',
        passwordHash: User.hashPassword('password123'),
      });

      const response = await api
        .post('/api/auth/forgot-password')
        .send({
          email: 'forgot@test.com',
          role: 'user',
        });

      expect(response.status).toBe(200);
      expect(response.body.otpSent).toBe(true);
    });
  });
});
