// Jest setup file
const { sequelize } = require('./config/db');

// Close database connection after all tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

// Mock console.error to reduce noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});
