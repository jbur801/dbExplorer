
export default {
  preset: 'ts-jest', // if TypeScript
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Adjust based on your alias setup
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest', // Use ts-jest for .ts, .tsx files
    '^.+\\.jsx?$': 'babel-jest',  // Use babel-jest for .js, .jsx files
  },

  setupFilesAfterEnv: ['@testing-library/jest-dom'],

};
