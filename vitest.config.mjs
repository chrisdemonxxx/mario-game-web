import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './tests',
    include: ['**/*.e2e.test.js'],
    testTimeout: 30000,
  },
});