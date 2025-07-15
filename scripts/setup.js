#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up LLM Output Analysis Service...');

// Create necessary directories
const directories = [
  'data/results',
  'data/prompts',
  'logs',
  'src/tests/unit',
  'src/tests/integration',
  'src/tests/fixtures',
  'docs/examples'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .gitkeep files
const gitkeepFiles = [
  'data/results/.gitkeep',
  'logs/.gitkeep'
];

gitkeepFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '# This file keeps the directory in git\n');
    console.log(`✅ Created: ${file}`);
  }
});

// Copy environment template if .env doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env from template');
  console.log('⚠️  Remember to add your API keys to .env');
}

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Add your API keys to .env (optional)');
console.log('2. Run: npm test');
console.log('3. Try: npm run analyze');
console.log('4. Read the documentation in docs/');

const additionalScripts = {
    "setup": "node scripts/setup.js",
    "test:unit": "jest src/tests/unit",
    "test:integration": "jest src/tests/integration",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "clean": "rm -rf data/results/* logs/*",
    "build": "echo 'No build step required'",
    "validate": "npm run lint && npm run test",
    "research": "node src/examples/research-prompts.js",
    "temperature-study": "node src/examples/simple-usage.js temperature",
    "model-comparison": "node src/examples/simple-usage.js models"
  };
  
  console.log('\n📋 Additional npm scripts available:');
  Object.entries(additionalScripts).forEach(([name, cmd]) => {
    console.log(`   npm run ${name}`);
  });