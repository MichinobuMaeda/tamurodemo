// const { defaults } = require('jest-config')

module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/index.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/*.config.js'
  ],
  coverageDirectory: 'coverage',
  runner: 'jest-serial-runner',
  testEnvironment: 'node',
  testTimeout: 10 * 1000
}
