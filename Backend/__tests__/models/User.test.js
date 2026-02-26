const { sequelize } = require('../../config/db.test');
const User = require('../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('User.create', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test User',
        role: 'user',
        passwordHash: User.hashPassword('password123'),
      };

      const user = await User.create(userData);
      
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('Test User');
      expect(user.role).toBe('user');
      expect(user.passwordHash).toBeDefined();
    });

    it('should not allow null email', async () => {
      await expect(User.create({
        firstName: 'Test',
        passwordHash: 'hash',
      })).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        firstName: 'First User',
        role: 'user',
        passwordHash: User.hashPassword('password123'),
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('User.hashPassword', () => {
    it('should hash password consistently', () => {
      const hash1 = User.hashPassword('testpassword');
      const hash2 = User.hashPassword('testpassword');
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', () => {
      const hash1 = User.hashPassword('password1');
      const hash2 = User.hashPassword('password2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('User.prototype.comparePassword', () => {
    it('should return true for correct password', async () => {
      const user = await User.create({
        email: 'compare@test.com',
        firstName: 'Compare User',
        role: 'user',
        passwordHash: User.hashPassword('correctpassword'),
      });

      const isMatch = user.comparePassword('correctpassword');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'compare2@test.com',
        firstName: 'Compare User 2',
        role: 'user',
        passwordHash: User.hashPassword('correctpassword'),
      });

      const isMatch = user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('User roles', () => {
    it('should default to user role', async () => {
      const user = await User.create({
        email: 'defaultrole@test.com',
        firstName: 'Default Role',
        passwordHash: User.hashPassword('password'),
      });

      expect(user.role).toBe('user');
    });

    it('should allow admin role', async () => {
      const user = await User.create({
        email: 'admin@test.com',
        firstName: 'Admin User',
        role: 'admin',
        passwordHash: User.hashPassword('password'),
      });

      expect(user.role).toBe('admin');
    });
  });
});
