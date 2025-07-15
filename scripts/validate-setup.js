#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Project Setup...');

const checks = [
  {
    name: 'Node.js version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      return major >= 16;
    },
    message: 'Node.js 16+ required'
  },
  {
    name: 'Package.json exists',
    check: () => fs.existsSync(path.join(__dirname, '..', 'package.json')),
    message: 'package.json not found'
  },
  {
    name: 'Dependencies installed',
    check: () => fs.existsSync(path.join(__dirname, '..', 'node_modules')),
    message: 'Run npm install'
  },
  {
    name: 'Environment file',
    check: () => fs.existsSync(path.join(__dirname, '..', '.env')),
    message: '.env file not found - copy from .env.example'
  },
  {
    name: 'Results directory',
    check: () => fs.existsSync(path.join(__dirname, '..', 'data', 'results')),
    message: 'Results directory missing'
  },
  {
    name: 'Test files',
    check: () => fs.existsSync(path.join(__dirname, '..', 'src', 'tests')),
    message: 'Test directory missing'
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const result = check.check();
  if (result) {
    console.log(`✅ ${check.name}`);
    passed++;
  } else {
    console.log(`❌ ${check.name}: ${check.message}`);
    failed++;
  }
});

console.log(`\n📊 Validation Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 Setup is valid! You can now run the analysis.');
  console.log('\nNext steps:');
  console.log('  npm test           # Run tests');
  console.log('  npm run analyze    # Run analysis');
  console.log('  npm run research   # Run research examples');
} else {
  console.log('⚠️  Please fix the issues above before continuing.');
  process.exit(1);
}