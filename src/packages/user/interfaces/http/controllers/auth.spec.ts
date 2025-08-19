import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@user/interfaces/http/controllers/auth';
import { LoginUseCase } from '@user/application/use-cases/login';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { RegisterUserUseCase } from '@user/application/use-cases/register';
import { RegisterDto } from '@user/interfaces/http/dtos/register';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { User } from '@user/domain/entities/user';
import { UserMapper } from '@user/interfaces/http/mappers/user';
import { ListUsersUseCase } from '@user/application/use-cases/list';

describe('@user/interfaces/http/controllers/auth', () => {
    let authController: AuthController;
    let registerUseCase: jest.Mocked<RegisterUserUseCase>;
    let loginUseCase: jest.Mocked<LoginUseCase>;
    let listUsersUseCase: jest.Mocked<ListUsersUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: RegisterUserUseCase,
                    useValue: createMock<RegisterUserUseCase>(),
                },
                {
                    provide: LoginUseCase,
                    useValue: createMock<LoginUseCase>(),
                },
                {
                    provide: ListUsersUseCase,
                    useValue: createMock<ListUsersUseCase>(),
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        registerUseCase = module.get<RegisterUserUseCase>(
            RegisterUserUseCase,
        ) as jest.Mocked<RegisterUserUseCase>;
        loginUseCase = module.get<LoginUseCase>(
            LoginUseCase,
        ) as jest.Mocked<LoginUseCase>;
        listUsersUseCase = module.get<ListUsersUseCase>(
            ListUsersUseCase,
        ) as jest.Mocked<ListUsersUseCase>;
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
                    createdAt: userResult.createdAt.toISOString(),
                    updatedAt: userResult.updatedAt.toISOString(),
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

    describe('listUsers', () => {
        it('should return all users', async () => {
            const mockUsers = [
                new User({
                    id: '1',
                    username: 'user1',
                    email: 'user1@example.com',
                    passwordHash: 'hash1',
                }),
                new User({
                    id: '2',
                    username: 'user2',
                    email: 'user2@example.com',
                    passwordHash: 'hash2',
                }),
            ];

            (listUsersUseCase.execute as jest.Mock).mockResolvedValue(mockUsers);

            const result = await authController.listUsers();

            expect(listUsersUseCase.execute).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                statusCode: 200,
                data: mockUsers.map(user => UserMapper.toDto(user)),
            });
        });

        it('should return empty array when no users exist', async () => {
            (listUsersUseCase.execute as jest.Mock).mockResolvedValue([]);

            const result = await authController.listUsers();

            expect(listUsersUseCase.execute).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                statusCode: 200,
                data: [],
            });
        });
    });
});
