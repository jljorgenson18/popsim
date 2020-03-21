// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
module.exports = {
  clearMocks: true,
  testMatch: ['<rootDir>/tests/specs/**/*.[tj]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/mocks/fileMock.ts',
    '\\.(css|less)$': '<rootDir>/tests/mocks/styleMock.ts',
    '\\.(mdx)$': '<rootDir>/tests/mocks/mdxMock.tsx'
  }
};
