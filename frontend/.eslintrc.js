module.exports = {
    env: {
      browser: true,
      es2021: true,
      jest: true, // Or vitest: true if using Vitest
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime', // If using new JSX transform
      'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: [
      'react',
      // 'prettier' is included by 'plugin:prettier/recommended'
    ],
    rules: {
      'prettier/prettier': 'warn', // Show Prettier issues as warnings
      'react/prop-types': 'off', // Turn off prop-types if using TypeScript or prefer not to use them
      // Add other custom rules here
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  };