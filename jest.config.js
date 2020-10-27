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
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/functions/'],
  testTimeout: 10 * 1000
}
