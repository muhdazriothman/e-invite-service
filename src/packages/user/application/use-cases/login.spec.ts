import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { LoginUseCase } from './login';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { UserRepository } from '@user/domain/repositories/user';
import { JwtService } from '@user/application/interfaces/jwt-service';
import { HashService } from '@user/application/interfaces/hash-service';
import { User } from '@user/domain/entities/user';

describe('@user/application/use-cases/login', () => {
    let loginUseCase: LoginUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockJwtService: jest.Mocked<JwtService>;
    let mockHashService: jest.Mocked<HashService>;

    beforeEach(async () => {
        mockUserRepository = {
            findByUsername: jest.fn(),
        } as jest.Mocked<UserRepository>;

        mockJwtService = {
            sign: jest.fn(),
            verify: jest.fn(),
        } as jest.Mocked<JwtService>;

        mockHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        } as jest.Mocked<HashService>;

        const moduleRef = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: 'JwtService',
                    useValue: mockJwtService,
                },
                {
                    provide: 'HashService',
                    useValue: mockHashService,
                },
            ],
        }).compile();

        loginUseCase = moduleRef.get<LoginUseCase>(LoginUseCase);
    });

    it('should be defined', () => {
        expect(loginUseCase).toBeDefined();
    });

    describe('execute', () => {
        const loginDto: LoginDto = {
            username: 'admin',
            password: 'admin',
        };

        const mockUser = new User({
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: 'hashed_password',
        });

        it('should return an access token when credentials are valid', async () => {
            mockUserRepository.findByUsername.mockResolvedValue(mockUser);
            mockHashService.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt_token');

            const result = await loginUseCase.execute(loginDto);

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(loginDto.username);
            expect(mockHashService.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                username: mockUser.username
            });
            expect(result).toEqual({ accessToken: 'jwt_token' });
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            mockUserRepository.findByUsername.mockResolvedValue(null);

            await expect(loginUseCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException('Invalid credentials')
            );

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(loginDto.username);
            expect(mockHashService.compare).not.toHaveBeenCalled();
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            mockUserRepository.findByUsername.mockResolvedValue(mockUser);
            mockHashService.compare.mockResolvedValue(false);

            await expect(loginUseCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException('Invalid credentials')
            );

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(loginDto.username);
            expect(mockHashService.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });
    });
});