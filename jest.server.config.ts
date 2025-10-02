export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/server/**/*.test.ts'
  ],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
};