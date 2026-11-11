// Shared Jest config. Tests live under tests/ and end with .test.js
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverageFrom: ['src/**/*.js', 'server.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov'],
    clearMocks: true,
};
