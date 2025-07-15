process.env.NODE_ENV = 'test';

// Mock API keys for testing
process.env.OPENAI_API_KEY = 'test-key';
process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.GOOGLE_API_KEY = 'test-key';
process.env.DEEPSEEK_API_KEY = 'test-key';

// Increase timeout for embedding model loading
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};