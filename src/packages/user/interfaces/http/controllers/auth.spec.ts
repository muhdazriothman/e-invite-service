import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@user/interfaces/http/controllers/auth';
import { LoginUseCase } from '@user/application/use-cases/login';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { RegisterUseCase } from '@user/application/use-cases/register';
import { RegisterDto } from '@user/interfaces/http/dtos/register';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@user/interfaces/http/controllers/auth', () => {
    let authController: AuthController;
    let registerUseCase: jest.Mocked<RegisterUseCase>;
    let loginUseCase: jest.Mocked<LoginUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: RegisterUseCase,
                    useValue: createMock<RegisterUseCase>(),
                },
                {
                    provide: LoginUseCase,
                    useValue: createMock<LoginUseCase>(),
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        registerUseCase = module.get<RegisterUseCase>(
            RegisterUseCase,
        ) as jest.Mocked<RegisterUseCase>;
        loginUseCase = module.get<LoginUseCase>(
            LoginUseCase,
        ) as jest.Mocked<LoginUseCase>;
    });

    describe('#register', () => {
        it('should call RegisterUseCase.execute and return formatted response', async () => {
            const registerDto: RegisterDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
            } as RegisterDto;

            const userResult = UserFixture.getUserEntity({
                id: 'user-id-1',
                username: registerDto.username,
                email: registerDto.email,
                passwordHash: 'hash',
            });

            const expectedResponse = {
                statusCode: 201,
                data: {
                    id: userResult.id,
                    username: userResult.username,
                    email: userResult.email,
                    isDeleted: false,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    deletedAt: null,
                },
            };

            (registerUseCase.execute as jest.Mock).mockResolvedValue(userResult);

            const result = await authController.register(registerDto);

            expect(result).toEqual(expectedResponse);
            expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
        });

        it('should propagate errors from the register use case', async () => {
            const registerDto: RegisterDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
            } as RegisterDto;

            const error = new Error('User already exists');
            (registerUseCase.execute as jest.Mock).mockRejectedValue(error);

            await expect(authController.register(registerDto)).rejects.toThrow(error);
            expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('#login', () => {
        it('should call LoginUseCase.execute and return formatted response', async () => {
            const loginDto: LoginDto = {
                username: 'testuser',
                password: 'password123',
            };

            const tokenResult = { accessToken: 'jwt-token' };
            const expectedResponse = {
                statusCode: 200,
                data: tokenResult,
            };

            (loginUseCase.execute as jest.Mock).mockResolvedValue(tokenResult);

            const result = await authController.login(loginDto);

            expect(result).toEqual(expectedResponse);
            expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
        });

        it('should propagate errors from the login use case', async () => {
            const loginDto: LoginDto = {
                username: 'testuser',
                password: 'wrongpassword',
            };

            const error = new Error('Authentication failed');
            (loginUseCase.execute as jest.Mock).mockRejectedValue(error);

            await expect(authController.login(loginDto)).rejects.toThrow(error);
            expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
        });
    });
});
