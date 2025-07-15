module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
      '**/__tests__/**/*.js',
      '**/?(*.)+(spec|test).js'
    ],
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/tests/**',
      '!src/examples/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
    testTimeout: 30000,
    verbose: true
  };