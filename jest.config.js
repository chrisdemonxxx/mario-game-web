// Shared Jest config. Tests live under tests/ and end with .test.js
// Note: E2E bootstrap tests are excluded due to puppeteer ESM compatibility issues
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    testPathIgnorePatterns: ['e2e-bootstrap'],
    collectCoverageFrom: ['src/**/*.js', 'server.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov'],
    clearMocks: true,
};