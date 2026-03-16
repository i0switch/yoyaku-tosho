module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  modulePathIgnorePatterns: ['.agent', '.claude', '.agents', '.codex', '.gemini'],
};
