globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json',
};

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        isolatedModules: true,
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!flat|@azure)/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  fakeTimers: {
    enableGlobally: false, // Avoid issues with MSAL async operations
  },
  maxWorkers: '50%',
  testTimeout: 10000,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Ensure test isolation
  globals: {
    'jest-preset-angular': {
      teardown: { destroyAfterEach: true }, // Mimics TestBed teardown
    },
  },
};
