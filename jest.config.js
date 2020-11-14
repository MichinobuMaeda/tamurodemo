// const { defaults } = require('jest-config')

module.exports = {
  collectCoverageFrom: [
    'src/auth/*.{js,jsx}',
    'src/store/*.{js,jsx}',
    // '**/*.{js,jsx}',
    '!**/index.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/functions/**'
  ],
  coverageDirectory: 'coverage',
  runner: 'jest-serial-runner',
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'
  ],
  testTimeout: 10 * 1000
}
