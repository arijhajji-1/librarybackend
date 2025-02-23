/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",  // Use ts-jest to handle TypeScript
    testEnvironment: "node",  // Simulate a Node.js environment
    transform: {
      "^.+\\.ts$": "ts-jest",  // Transform TypeScript files
    },
    moduleFileExtensions: ["ts", "js"],  // Recognize .ts and .js files
    testMatch: ["**/tests/**/*.test.ts"],  // Specify where test files are located
  };
  