module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!server.js',
    '!seed.js',
    '!**/node_modules/**'
  ],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['./jest.setup.js']
};
