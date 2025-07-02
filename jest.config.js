module.exports = {
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
};
