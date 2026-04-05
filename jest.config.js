/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react', esModuleInterop: true, module: 'commonjs' },
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: { allowJs: true, esModuleInterop: true, module: 'commonjs' },
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@material/material-color-utilities)/)',
  ],
};
