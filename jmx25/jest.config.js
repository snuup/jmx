// jest.config.js
module.exports = {
    testEnvironment: 'happy-dom', // Use Happy DOM as the test environment
    testMatch: ['**/tests/**/*.tsx'], // Look for test files in __tests__ folders
    //setupFilesAfterEnv: ['./jest.setup.js'], // Optional: Add global setup file
  };