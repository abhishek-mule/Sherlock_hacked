module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/'],
  dependencies: {
    // Force specific versions of dependencies to resolve conflicts
    '@mui/material': {
      platforms: {
        android: null, // Don't link on native
        ios: null, // Don't link on native
      },
    },
    '@mui/icons-material': {
      platforms: {
        android: null, // Don't link on native
        ios: null, // Don't link on native
      },
    },
  },
}; 