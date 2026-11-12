// Shared Jest config. Tests live under tests/ and end with .test.js
// E2E tests (*.e2e.test.js) are run separately with vitest
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    testPathIgnorePatterns: ['e2e'],
    collectCoverageFrom: ['src/**/*.js', 'server.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov'],
    clearMocks: true,
};
