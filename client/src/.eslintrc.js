module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true, // If you're using JSX
        },
    },
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'eslint:recommended', 
        'plugin:react/recommended'
    ],
    settings: {
        react: {
            version: 'detect', // Automatically detect the React version
        }
    },
    plugins: ['react'],
    rules: {
        'react/react-in-jsx-scope': 'off',  // Disable React in scope for JSX (React 17+)
        'react/prop-types': 'warn',         // Warn for missing PropTypes validation
        // Add other custom rules if needed
    },
};
