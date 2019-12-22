module.exports = api => {
  const env = process.env.NODE_ENV;
  const isTest = api.env('test');
  const isDev = !api.env('production');
  api.cache.using(() => env);
  return {
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-env',
        isTest
          ? {
              debug: false,
              useBuiltIns: 'usage',
              corejs: '3',
              targets: {
                node: 'current'
              }
            }
          : {
              modules: false,
              debug: false,
              useBuiltIns: 'usage',
              corejs: '3'
            }
      ],
      '@babel/preset-react'
    ],
    plugins: [
      isTest
        ? [
            'module-resolver',
            {
              alias: {
                src: './src',
                tests: './tests'
              }
            }
          ]
        : null,
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      'lodash',
      isDev ? 'react-hot-loader/babel' : null,
      'babel-plugin-styled-components'
    ].filter(Boolean)
  };
};
