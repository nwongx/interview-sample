module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  overrides: [
    {
      files: [
        '*.ts',
        '*.tsx',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb-typescript-prettier',
      ],
      parserOptions: {
        project: [
          './tsconfig.json',
        ],
      },
      rules: {
        'react/require-default-props': 'off',
        'import/prefer-default-export': 'off',
        "prettier/prettier": ["error", { "singleQuote": true }],
        "func-names": ["error", "never"],
        "react/jsx-no-bind": ["error", {
          "allowArrowFunctions": true,
          "allowFunctions": true
        }]
      },
    },
  ],
  rules: {
  },
};
