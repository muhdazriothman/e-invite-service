import { JwtService } from '@user/application/interfaces/jwt-service';

describe('@user/application/interfaces/jwt-service', () => {
    let jwtService: JwtService;

    beforeEach(() => {
        jwtService = {
            sign: jest.fn(),
            verify: jest.fn()
        };
    });

    describe('sign', () => {
        it('should sign a payload and return a token', () => {
            const payload = { userId: '123', username: 'testuser' };
            const token = 'jwt.token.string';

            jest.spyOn(jwtService, 'sign').mockReturnValue(token);

            const result = jwtService.sign(payload);

            expect(result).toBe(token);
            expect(jwtService.sign).toHaveBeenCalledWith(payload);
        });
    });

    describe('verify', () => {
        it('should verify a valid token and return the decoded payload', () => {
            const token = 'valid.jwt.token';
            const decodedPayload = { userId: '123', username: 'testuser' };

            jest.spyOn(jwtService, 'verify').mockReturnValue(decodedPayload);

            const result = jwtService.verify(token);

            expect(result).toEqual(decodedPayload);
            expect(jwtService.verify).toHaveBeenCalledWith(token);
        });

        it('should throw an error for an invalid token', () => {
            const invalidToken = 'invalid.token';

            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => jwtService.verify(invalidToken)).toThrow('Invalid token');
            expect(jwtService.verify).toHaveBeenCalledWith(invalidToken);
        });

        it('should throw an error for an expired token', () => {
            const expiredToken = 'expired.token';

            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw new Error('Token expired');
            });

            expect(() => jwtService.verify(expiredToken)).toThrow('Token expired');
            expect(jwtService.verify).toHaveBeenCalledWith(expiredToken);
        });
    });
});