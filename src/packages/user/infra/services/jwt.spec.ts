import { JwtServiceImpl } from '@user/infra/services/jwt';
import { JwtService } from '@nestjs/jwt';
import { createMock } from '@test/utils/mocks';

describe('@user/infra/services/jwt', () => {
  let jwtServiceImpl: JwtServiceImpl;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockJwtService = createMock<JwtService>({
      sign: jest.fn(),
      verify: jest.fn(),
    });
    jwtServiceImpl = new JwtServiceImpl(mockJwtService);
  });

  describe('#sign', () => {
    it('should sign a payload and return a token', () => {
      const payload = { userId: '123', username: 'testuser' };
      const token = 'signed.jwt.token';

      (mockJwtService.sign as jest.Mock).mockReturnValue(token);

      const result = jwtServiceImpl.sign(payload);

      expect(result).toBe(token);
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('#verify', () => {
    it('should verify a token and return the decoded payload', () => {
      const token = 'valid.jwt.token';
      const decodedPayload = { userId: '123', username: 'testuser' };

      (mockJwtService.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = jwtServiceImpl.verify(token);

      expect(result).toBe(decodedPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw an error when token is invalid', () => {
      const invalidToken = 'invalid.token';
      const error = new Error('Invalid token');

      (mockJwtService.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => jwtServiceImpl.verify(invalidToken)).toThrow(error);
      expect(mockJwtService.verify).toHaveBeenCalledWith(invalidToken);
    });
  });
});
