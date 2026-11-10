module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js', '!src/**/__tests__.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/src/__tests__.js'],
  verbose: true,
  testTimeout: 10000
};
