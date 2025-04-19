# Sherlock Student Database Mobile App

A powerful student database application built with Next.js and React Native + Expo. This app allows you to search, view, and manage student records, with additional features like email lookups and OSINT enrichment.

## Features

- Student search and detailed profiles
- Admission data search
- Email intelligence lookup
- Mobile app support through React Native
- Beautiful UI with dark mode support

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 7.x or higher
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/) for building APKs

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abhishek-mule/Sherlock_hacked.git
   cd Sherlock_hacked
   ```

2. Install dependencies:
   ```bash
   npm run setup
   ```
   This script:
   - Cleans npm cache
   - Removes node_modules and package-lock.json
   - Installs dependencies with the legacy-peer-deps flag
   - Fixes Material UI import issues

3. Check your environment:
   ```bash
   npm run check-env
   ```

### Development

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the Expo app:
   ```bash
   npm run android
   ```

### Building the APK

To build an Android APK:

```bash
npm run build:android
```

This will create an APK using EAS Build that can be installed on Android devices.

## Troubleshooting

If you encounter any issues, please check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) file for solutions to common problems.

### Quick Fixes

- **Dependency conflicts**: Run `npm run setup` to reinstall dependencies with correct flags
- **Material UI import errors**: Run `npm run fix-mui` to create a helper file for MUI components
- **Metro bundler issues**: Run `npx react-native start --reset-cache` to clear the cache

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
