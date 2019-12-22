// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
module.exports = {
  clearMocks: true,
  testMatch: ['<rootDir>/tests/specs/**/*.[tj]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
