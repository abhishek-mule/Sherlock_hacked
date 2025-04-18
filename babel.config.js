module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            // Use specific file imports for Material-UI to avoid barrel imports
            '@mui/material': '@mui/material/esm',
            '@mui/icons-material': '@mui/icons-material/esm'
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
}; 