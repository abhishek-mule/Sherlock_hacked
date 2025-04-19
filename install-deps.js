/**
 * This script handles the installation of dependencies with the correct flags
 * to resolve peer dependency conflicts between React Native and other packages.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Installing dependencies with appropriate flags to resolve conflicts...');

try {
  // Clean installation cache
  console.log('🧹 Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  
  // Remove node_modules and package-lock.json for a clean start
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('🗑️ Removing node_modules directory...');
    execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
    console.log('🗑️ Removing package-lock.json...');
    fs.unlinkSync(path.join(__dirname, 'package-lock.json'));
  }

  // Install dependencies with legacy-peer-deps flag
  console.log('📦 Installing dependencies with legacy-peer-deps...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Install dev dependencies separately with legacy-peer-deps flag
  console.log('📦 Installing dev dependencies...');
  execSync('npm install --only=dev --legacy-peer-deps', { stdio: 'inherit' });
  
  // Run the MUI fix script
  console.log('🔧 Fixing Material UI imports...');
  if (fs.existsSync(path.join(__dirname, 'fix-mui-imports.js'))) {
    execSync('node fix-mui-imports.js', { stdio: 'inherit' });
  } else {
    console.warn('⚠️ fix-mui-imports.js not found, skipping MUI fix');
  }
  
  console.log('✅ Dependencies installed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run `npm run dev` to start the Next.js development server');
  console.log('2. In a separate terminal, run `npm run android` to start the Expo development server');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
} 