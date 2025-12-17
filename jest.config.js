/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // 1. Point to your source root
  rootDir: './', 
  
  // 2. Handle Path Aliases (@/ -> src/)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 3. Ignore build folders and node_modules
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  // 4. (Optional) Show verbose output
  verbose: true
};