export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/client/**/*.test.ts',
    '**/tests/client/**/*.test.tsx'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};