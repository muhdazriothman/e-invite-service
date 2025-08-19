import { JwtStrategy } from '@user/interfaces/http/strategies/jwt';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@test/utils/mocks';

describe('@user/interfaces/http/strategies/jwt', () => {
    let jwtStrategy: JwtStrategy;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(() => {
        mockConfigService = createMock<ConfigService>({
            get: jest.fn().mockReturnValue('test-jwt-secret'),
        });
        jwtStrategy = new JwtStrategy(mockConfigService);
    });

    describe('#constructor', () => {
        it('should throw error when JWT_SECRET is not configured', () => {
            mockConfigService = createMock<ConfigService>({
                get: jest.fn().mockReturnValue(undefined),
            });

            expect(() => new JwtStrategy(mockConfigService)).toThrow(
                'JWT_SECRET environment variable is not set',
            );
        });
    });

    describe('#validate', () => {
        it('should return user payload when JWT is valid', async () => {
            const payload = { sub: 'user-id', username: 'testuser' };

            const result = await jwtStrategy.validate(payload);

            expect(result).toEqual(payload);
        });
    });
});
