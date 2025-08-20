import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUserUseCase } from './login';
import { UserRepository } from '@user/infra/repository';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { HashService } from '@common/services/hash';
import { JwtService } from '@common/services/jwt';
import { UserFixture } from '@test/fixture/user';

describe('LoginUserUseCase', () => {
    let useCase: LoginUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let hashService: jest.Mocked<HashService>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUsername: jest.fn(),
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
                LoginUserUseCase,
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

        useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
        userRepository = module.get('UserRepository');
        hashService = module.get('HashService');
        jwtService = module.get('JwtService');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        const loginDto: LoginDto = {
            username: 'admin',
            password: 'admin',
        };

        const mockUser = UserFixture.getAdminUser();

        it('should return an access token when credentials are valid', async () => {
            userRepository.findByUsername.mockResolvedValue(mockUser);
            hashService.compare.mockResolvedValue(true);
            jwtService.sign.mockReturnValue('jwt_token');

            const result = await useCase.execute(loginDto);

            expect(userRepository.findByUsername).toHaveBeenCalledWith(
                loginDto.username,
            );
            expect(hashService.compare).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.passwordHash,
            );
            expect(jwtService.sign).toHaveBeenCalledWith({
                userId: mockUser.id,
                username: mockUser.username,
            });
            expect(result).toEqual({ user: mockUser, token: 'jwt_token' });
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            userRepository.findByUsername.mockResolvedValue(null);

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException('Invalid credentials'),
            );

            expect(userRepository.findByUsername).toHaveBeenCalledWith(
                loginDto.username,
            );
            expect(hashService.compare).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            userRepository.findByUsername.mockResolvedValue(mockUser);
            hashService.compare.mockResolvedValue(false);

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException('Invalid credentials'),
            );

            expect(userRepository.findByUsername).toHaveBeenCalledWith(
                loginDto.username,
            );
            expect(hashService.compare).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.passwordHash,
            );
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
    });
});
