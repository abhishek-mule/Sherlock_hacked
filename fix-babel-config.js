/**
 * This script helps manage the conflict between Next.js SWC compiler and Babel
 * by creating a modified Babel configuration that specifically excludes Next.js files.
 */
const fs = require('fs');
const path = require('path');

console.log('🔄 Fixing Babel configuration for Next.js compatibility...');

// Create a function to check if a file should be ignored by Babel
const isNextJsFile = (filename) => {
  // Skip Next.js pages and app folder files
  if (filename.startsWith('app/') || filename.startsWith('pages/')) {
    return true;
  }
  
  // Skip any .next directory files
  if (filename.includes('.next/')) {
    return true;
  }
  
  // Skip Next.js specific files
  if (filename.endsWith('.next.js') || filename.endsWith('.next.ts') || 
      filename.endsWith('.next.jsx') || filename.endsWith('.next.tsx')) {
    return true;
  }
  
  return false;
};

try {
  // Read the existing babel.config.js
  const babelConfigPath = path.join(__dirname, 'babel.config.js');
  const babelConfigContent = fs.readFileSync(babelConfigPath, 'utf8');
  
  // Create a new version that ignores Next.js files
  const newBabelConfig = `module.exports = function(api) {
  api.cache(true);
  
  // Skip transformation of Next.js files 
  api.caller((caller) => {
    const isNextJs = caller && caller.name === 'next-babel-turbo-loader';
    if (isNextJs) {
      return false; // Skip transforming Next.js files with this config
    }
    return true;
  });
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './'
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    }
  };
};`;

  // Write the new config
  fs.writeFileSync(babelConfigPath, newBabelConfig);
  
  // Update .babelrc as well
  const babelrcPath = path.join(__dirname, '.babelrc');
  const babelrcContent = JSON.parse(fs.readFileSync(babelrcPath, 'utf8'));
  
  // Add a comment to .babelrc about its purpose
  const babelrcComment = `{
  /* This config is for React Native only. Next.js uses SWC. */
  "presets": ["babel-preset-expo"],
  "plugins": [
    "react-native-reanimated/plugin",
    [
      "module-resolver",
      {
        "root": ["./"],
        "alias": {
          "@": "./"
        }
      }
    ]
  ],
  "env": {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}`;

  fs.writeFileSync(babelrcPath, babelrcComment);
  
  console.log('✅ Babel configuration updated!');
  console.log('Now Next.js will use SWC for web files, and Babel will be used for React Native.');
} catch (error) {
  console.error('❌ Error updating Babel configuration:', error.message);
  process.exit(1);
} 