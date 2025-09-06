module.exports = {
    moduleNameMapper: {
        '^@auth/(.*)$': '<rootDir>/src/packages/auth/$1',
        '^@shared/(.*)$': '<rootDir>/src/packages/shared/$1',
        '^@flight/(.*)$': '<rootDir>/src/packages/flight/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@test/(.*)$': '<rootDir>/test/$1',
        '^@user/(.*)$': '<rootDir>/src/packages/user/$1',
        '^@invitation/(.*)$': '<rootDir>/src/packages/invitation/$1',
        '^@payment/(.*)$': '<rootDir>/src/packages/payment/$1',
        '^test/(.*)$': '<rootDir>/test/$1'
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: ['<rootDir>/test/setup-env.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/setup/matchers.ts']
};