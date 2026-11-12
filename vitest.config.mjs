import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/e2e-*.test.js'],
        timeout: 30000,
        testTimeout: 30000,
    },
});
