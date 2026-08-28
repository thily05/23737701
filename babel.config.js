module.exports = {
  presets: ['module:@react-native/babel-preset'],

  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],

        extensions: [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
        ],

        alias: {
          '@constants': './src/constants',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@contexts': './src/contexts',
          '@hooks': './src/hooks',
        },
      },
    ],
  ],
};