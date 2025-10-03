import { LoginUseCase } from '@auth/application/use-cases/login';
import { LoginDto } from '@auth/interfaces/http/dtos/login';
import {
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { authErrors } from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { UserType } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

describe('@auth/application/use-cases/login', () => {
    const userId = '000000000000000000000001';
    const email = 'test@example.com';
    const password = 'password123';
    const token = 'jwt-token-123';

    let useCase: LoginUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockJwtService: jest.Mocked<JwtService>;

    const user = UserFixture.getEntity({
        id: userId,
        email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
    });

    const adminUser = UserFixture.getEntity({
        id: '000000000000000000000002',
        email,
        passwordHash: 'hashedPassword123',
        type: UserType.ADMIN,
    });

    const deletedUser = UserFixture.getEntity({
        id: userId,
        email,
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
        isDeleted: true,
    });

    const loginDto: LoginDto = {
        email,
        password,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                {
                    provide: UserRepository,
                    useValue: createMock<UserRepository>(),
                },
                {
                    provide: JwtService,
                    useValue: createMock<JwtService>(),
                },
            ],
        }).compile();

        useCase = module.get<LoginUseCase>(LoginUseCase);
        mockUserRepository = module.get(UserRepository);
        mockJwtService = module.get(JwtService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        let mockValidateUser: jest.SpyInstance;
        let mockValidatePassword: jest.SpyInstance;

        beforeEach(() => {
            mockValidateUser = jest.spyOn(
                useCase,
                'validateUser',
            ).mockResolvedValue(user);

            mockValidatePassword = jest.spyOn(
                LoginUseCase,
                'validatePassword',
            ).mockResolvedValue();

            mockJwtService.sign.mockReturnValue(token);
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        it('should return a JWT token when credentials are valid', async () => {
            const result = await useCase.execute(loginDto);

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).toHaveBeenCalledWith(password, user);

            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: user.id,
                email: user.email,
                type: user.type,
            });

            expect(result).toEqual({ token });
        });

        it('should return a JWT token for admin user when credentials are valid', async () => {
            mockValidateUser.mockResolvedValue(adminUser);

            const result = await useCase.execute(loginDto);

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).toHaveBeenCalledWith(password, adminUser);

            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: adminUser.id,
                email: adminUser.email,
                type: adminUser.type,
            });

            expect(result).toEqual({ token });
        });

        it('should handle UnauthorizedException', async () => {
            mockValidatePassword.mockRejectedValue(
                new UnauthorizedException(authErrors.INVALID_CREDENTIALS),
            );

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException(authErrors.INVALID_CREDENTIALS),
            );

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).toHaveBeenCalledWith(password, user);
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle UnauthorizedException when user validation fails', async () => {
            mockValidateUser.mockRejectedValue(
                new UnauthorizedException(authErrors.INVALID_CREDENTIALS),
            );

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException(authErrors.INVALID_CREDENTIALS),
            );

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).not.toHaveBeenCalled();
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle UnauthorizedException when user is deleted', async () => {
            mockValidateUser.mockRejectedValue(
                new UnauthorizedException(authErrors.ACCOUNT_DEACTIVATED),
            );

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new UnauthorizedException(authErrors.ACCOUNT_DEACTIVATED),
            );

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).not.toHaveBeenCalled();
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle unexpected error from validateUser', async () => {
            mockValidateUser.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).not.toHaveBeenCalled();
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle unexpected error from validatePassword', async () => {
            mockValidatePassword.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).toHaveBeenCalledWith(password, user);
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle unexpected error from jwtService', async () => {
            mockJwtService.sign.mockImplementation(() => {
                throw new Error('JWT signing error');
            });

            await expect(useCase.execute(loginDto)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('JWT signing error'),
                ),
            );

            expect(mockValidateUser).toHaveBeenCalledWith(email);
            expect(mockValidatePassword).toHaveBeenCalledWith(password, user);
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: user.id,
                email: user.email,
                type: user.type,
            });
        });
    });

    describe('#validateUser', () => {
        it('should return user when found and not deleted', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(user);

            const result = await useCase.validateUser(email);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toEqual(user);
        });

        it('should handle UnauthorizedException when user is not found', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(useCase.validateUser(email)).rejects.toThrow(
                new UnauthorizedException(authErrors.INVALID_CREDENTIALS),
            );

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it('should handle UnauthorizedException when user is deleted', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(deletedUser);

            await expect(useCase.validateUser(email)).rejects.toThrow(
                new UnauthorizedException(authErrors.ACCOUNT_DEACTIVATED),
            );

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it('should handle unexpected error', async () => {
            mockUserRepository.findByEmail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.validateUser(email)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });

    describe('#validatePassword', () => {
        let mockCompare: jest.SpyInstance;

        beforeEach(() => {
            mockCompare = jest.spyOn(
                HashService,
                'compare',
            ).mockResolvedValue(true);
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        it('should not throw when password is valid', async () => {
            await expect(
                LoginUseCase.validatePassword(password, user),
            ).resolves.not.toThrow();

            expect(mockCompare).toHaveBeenCalledWith(
                password,
                user.passwordHash,
            );
        });

        it('should handle UnauthorizedException when password is invalid', async () => {
            mockCompare.mockResolvedValue(false);

            await expect(
                LoginUseCase.validatePassword(password, user),
            ).rejects.toThrow(
                new UnauthorizedException(authErrors.INVALID_CREDENTIALS),
            );

            expect(mockCompare).toHaveBeenCalledWith(
                password,
                user.passwordHash,
            );
        });

        it('should handle unexpected error', async () => {
            mockCompare.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(
                LoginUseCase.validatePassword(password, user),
            ).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });
});
