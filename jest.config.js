module.exports = {
    // Use node environment
    testEnvironment: 'node',

    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controller/**/*.js',
        'use-case/**/*.js',
        'utils/**/*.js',
        'middleware/**/*.js',
        '!**/node_modules/**',
        '!**/vendor/**'
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Test match patterns
    testMatch: [
        '**/__test__/**/*.test.js',
        '**/__test__/**/*.spec.js'
    ],

    // Setup files
    setupFilesAfterEnv: ['./__test__/setup.js'],

    // Verbose output
    verbose: true,

    // Timeout (10s)
    testTimeout: 10000
};
