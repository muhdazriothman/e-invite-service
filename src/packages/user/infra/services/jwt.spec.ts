import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtServiceImpl } from '@user/infra/services/jwt';

describe('@user/infra/services/jwt', () => {
    let jwtService: JwtServiceImpl;
    let nestJwtService: NestJwtService;

    beforeEach(() => {
        nestJwtService = {
            sign: jest.fn(),
            verify: jest.fn()
        } as unknown as NestJwtService;

        jwtService = new JwtServiceImpl(nestJwtService);
    });

    describe('#sign', () => {
        it('should sign a payload and return a token', () => {
            const payload = { userId: '123', username: 'testuser' };
            const token = 'signed.jwt.token';

            (nestJwtService.sign as jest.Mock).mockReturnValue(token);

            const result = jwtService.sign(payload);

            expect(result).toBe(token);
            expect(nestJwtService.sign).toHaveBeenCalledWith(payload);
        });
    });

    describe('#verify', () => {
        it('should verify a token and return the decoded payload', () => {
            const token = 'valid.jwt.token';
            const decodedPayload = { userId: '123', username: 'testuser' };

            (nestJwtService.verify as jest.Mock).mockReturnValue(decodedPayload);

            const result = jwtService.verify(token);

            expect(result).toBe(decodedPayload);
            expect(nestJwtService.verify).toHaveBeenCalledWith(token);
        });

        it('should throw an error when token is invalid', () => {
            const invalidToken = 'invalid.token';
            const error = new Error('Invalid token');

            (nestJwtService.verify as jest.Mock).mockImplementation(() => {
                throw error;
            });

            expect(() => jwtService.verify(invalidToken)).toThrow(error);
            expect(nestJwtService.verify).toHaveBeenCalledWith(invalidToken);
        });
    });
});