import { LoginUseCase } from '@auth/application/use-cases/login';
import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { UnauthorizedException } from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';
import { UserFixture } from '@test/fixture/user';
import { UserType } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';


describe('@auth/application/use-cases/login', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let hashService: jest.Mocked<HashService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async() => {
    const mockUserRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'HashService',
          useValue: mockHashService,
        },
        {
          provide: 'JwtService',
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get('UserRepository');
    hashService = module.get('HashService');
    jwtService = module.get('JwtService');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return a JWT token when credentials are valid', async() => {
      const user = UserFixture.getEntity({
        id: '1',
        email: loginDto.email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
      });
      const expectedToken = 'jwt-token-123';

      userRepository.findByEmail.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await useCase.execute(loginDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        type: user.type,
      });
      expect(result).toEqual({ token: expectedToken });
    });

    it('should return a JWT token for admin user when credentials are valid', async() => {
      const adminUser = UserFixture.getEntity({
        id: '2',
        email: loginDto.email,
        passwordHash: 'hashedPassword123',
        type: UserType.ADMIN,
      });
      const expectedToken = 'admin-jwt-token-123';

      userRepository.findByEmail.mockResolvedValue(adminUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await useCase.execute(loginDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        adminUser.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: adminUser.id,
        email: adminUser.email,
        type: adminUser.type,
      });
      expect(result).toEqual({ token: expectedToken });
    });

    it('should throw UnauthorizedException when user is not found', async() => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async() => {
      const user = UserFixture.getEntity({
        id: '1',
        email: loginDto.email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
      });

      userRepository.findByEmail.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(false);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is deleted', async() => {
      const deletedUser = UserFixture.getEntity({
        id: '1',
        email: loginDto.email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
        isDeleted: true,
      });

      userRepository.findByEmail.mockResolvedValue(deletedUser);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Account has been deactivated',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle hash service errors gracefully', async() => {
      const user = UserFixture.getEntity({
        id: '1',
        email: loginDto.email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
      });

      userRepository.findByEmail.mockResolvedValue(user);
      hashService.compare.mockRejectedValue(new Error('Hash service error'));

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Hash service error',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle JWT service errors gracefully', async() => {
      const user = UserFixture.getEntity({
        id: '1',
        email: loginDto.email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
      });

      userRepository.findByEmail.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(true);
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT service error');
      });

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'JWT service error',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        type: user.type,
      });
    });
  });
});
