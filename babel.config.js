module.exports = function(api) {
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
};