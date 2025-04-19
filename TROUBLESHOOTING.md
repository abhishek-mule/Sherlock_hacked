# Troubleshooting Guide for Sherlock Student Database

This document provides solutions to common issues that may arise when building or using the Sherlock Student Database app.

## Dependency Conflicts

### Material UI and React Native Conflicts

If you encounter error messages about conflicting star exports in `@mui/material` or related packages, follow these steps:

1. Run our specialized Material UI fix script:
   ```bash
   npm run fix-mui
   ```
   This script creates a helper file that properly handles Material UI component imports to avoid conflicts with React Native.

2. Make sure you're using the direct import style for Material UI components:
   ```jsx
   // AVOID this barrel import style:
   import { Button, TextField } from '@mui/material';
   
   // USE this direct import style instead:
   import Button from '@mui/material/Button';
   import TextField from '@mui/material/TextField';
   
   // OR use our helper (recommended for OSINTDashboard):
   import { Button, TextField } from './mui-components';
   ```

3. If problems persist, run the setup script which includes the MUI fix:
   ```bash
   npm run setup
   ```

4. If you still see errors, try cleaning your build cache:
   ```bash
   npx expo start --clear
   ```

### React Version Conflicts

If you encounter React version conflicts between React 18 and React 19:

1. Use our automated setup script to reinstall dependencies with the correct flags:
   ```bash
   npm run setup
   ```

2. If you prefer to do it manually, install dependencies with the legacy peer deps flag:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. Make sure your .babelrc and babel.config.js files are correctly set up as shown in the repository.

## Build Issues

### Expo Build Errors

If you encounter Expo build errors:

1. Make sure Expo CLI is installed and up to date:
   ```bash
   npm install -g expo-cli
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Try building with the non-interactive flag:
   ```bash
   eas build -p android --profile preview --non-interactive
   ```

### Metro Bundler Issues

If you encounter Metro bundler issues:

1. Make sure metro.config.js correctly extends the Expo configuration.

2. Clear the Metro cache:
   ```bash
   npx react-native start --reset-cache
   ```

## Running the App

### Development Mode

To run the app in development mode:

1. Start the Next.js app:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the Expo app:
   ```bash
   npm run android
   ```

### Testing Builds Locally

To test the APK locally:

1. Build the app for local testing:
   ```bash
   eas build --platform android --profile preview --local
   ```

2. Install the resulting APK on your device.

## GitHub Issues

If you continue to experience problems, please [open an issue](https://github.com/abhishek-mule/Sherlock_hacked/issues) on the GitHub repository with:

1. A detailed description of the problem
2. Your environment details (OS, Node version, npm version)
3. Steps to reproduce the issue
4. Any error messages or logs 