/**
 * This script checks the environment and dependencies for compatibility.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Checking environment and dependencies...\n');

// Get Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Check if Node.js version is compatible
const nodeVersionMajor = parseInt(nodeVersion.substring(1).split('.')[0]);
if (nodeVersionMajor < 14) {
  console.warn('⚠️ Warning: Node.js version is below recommended (v14+)');
}

// Get npm version
try {
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`npm version: ${npmVersion}`);
} catch (error) {
  console.error('❌ Error getting npm version:', error.message);
}

// Check if package.json exists
console.log('\n📦 Checking package.json...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

// Parse package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check React version
  const reactVersion = packageJson.dependencies.react;
  console.log(`React version: ${reactVersion}`);
  
  // Check React Native version
  const reactNativeVersion = packageJson.dependencies['react-native'];
  console.log(`React Native version: ${reactNativeVersion}`);
  
  // Check Expo version
  const expoVersion = packageJson.dependencies.expo;
  console.log(`Expo version: ${expoVersion}`);
  
  // Check compatibility
  console.log('\n🔄 Checking compatibility...');
  
  // React 18 is compatible with React Native up to v0.72.x
  if (reactVersion.includes('18') && !reactNativeVersion.includes('0.72')) {
    console.warn('⚠️ React 18 is most compatible with React Native v0.72.x');
    console.warn('   Consider updating your React Native version to 0.72.6');
  }
  
  // Expo 49 is compatible with React Native 0.72.x
  if (expoVersion.includes('49') && !reactNativeVersion.includes('0.72')) {
    console.warn('⚠️ Expo 49 is most compatible with React Native v0.72.x');
    console.warn('   Consider updating your React Native version to match Expo');
  }
  
} catch (error) {
  console.error('❌ Error parsing package.json:', error.message);
}

// Check if node_modules exists
console.log('\n📂 Checking node_modules...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.warn('⚠️ node_modules not found, dependencies may not be installed');
  console.warn('   Run `npm run setup` to install dependencies');
} else {
  console.log('✅ node_modules exists');
}

// Check for MUI packages
console.log('\n🎨 Checking Material UI packages...');
const muiPath = path.join(nodeModulesPath, '@mui');
if (fs.existsSync(muiPath)) {
  console.log('✅ @mui packages exist');
  
  // Check if mui-components helper exists
  const muiComponentsPath = path.join(__dirname, 'components', 'mui-components.js');
  if (!fs.existsSync(muiComponentsPath)) {
    console.warn('⚠️ mui-components.js helper not found');
    console.warn('   Run `npm run fix-mui` to create it');
  } else {
    console.log('✅ mui-components.js helper exists');
  }
} else {
  console.warn('⚠️ @mui packages not found in node_modules');
}

console.log('\n✅ Environment check complete!');
console.log('\nIf you\'re experiencing issues:');
console.log('1. Run `npm run setup` to reinstall dependencies and fix MUI imports');
console.log('2. Refer to TROUBLESHOOTING.md for specific solutions to common problems'); 