// const { defaults } = require('jest-config')

module.exports = {
  collectCoverageFrom: [
    'src/auth/*.{js,jsx}',
    'src/store/*.{js,jsx}',
    'functions/*.{js,jsx}',
    // '**/*.{js,jsx}',
    '!**/index.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/tools/**',
    '!**/*.config.js'
  ],
  coverageDirectory: 'coverage',
  runner: 'jest-serial-runner',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'
  ],
  testTimeout: 20 * 1000
}
