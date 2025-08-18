import { JwtStrategy } from '@user/interfaces/http/strategies/jwt';
import { ConfigService } from '@nestjs/config';

describe('@user/interfaces/http/strategies/jwt', () => {
    let jwtStrategy: JwtStrategy;
    let configService: ConfigService;

    beforeEach(() => {
        configService = {
            get: jest.fn().mockReturnValue('test-jwt-secret')
        } as any;

        jwtStrategy = new JwtStrategy(configService);
    });

    it('should be properly instantiated', () => {
        expect(jwtStrategy).toBeDefined();
        expect(jwtStrategy.validate).toBeDefined();
    });

    describe('#constructor', () => {
        it('should throw error if JWT_SECRET is not set', () => {
            const configServiceWithoutSecret = {
                get: jest.fn().mockReturnValue(undefined)
            } as any;

            expect(() => new JwtStrategy(configServiceWithoutSecret))
                .toThrow('JWT_SECRET environment variable is not set');
        });

        it('should be configured with the correct options', () => {
            expect(jwtStrategy).toBeDefined();
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
        });
    });

    describe('#validate', () => {
        it('should return the payload unchanged', async () => {
            const payload = {
                sub: '123',
                username: 'testuser'
            };

            const result = await jwtStrategy.validate(payload);

            expect(result).toBe(payload);
        });
    });
});