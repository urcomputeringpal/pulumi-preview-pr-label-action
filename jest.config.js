module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  globals: {
    'ts-jest': {
        tsconfig: 'tsconfig.test.json'
    },
},
}
