module.exports = {
    moduleNameMapper: {
        '^@common/(.*)$': '<rootDir>/src/packages/common/$1',
        '^@flight/(.*)$': '<rootDir>/src/packages/flight/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@test/(.*)$': '<rootDir>/src/test/$1',
        '^@user/(.*)$': '<rootDir>/src/packages/user/$1',
        '^test/(.*)$': '<rootDir>/test/$1'
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};