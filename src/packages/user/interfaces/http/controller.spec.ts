import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './controller';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { UserType } from '@user/domain/entities/user';
import { UserMapper } from '@user/interfaces/http/mapper';
import { UserFixture } from '@test/fixture/user';

describe('@user/interfaces/http/controller', () => {
    let controller: UserController;
    let createUserUseCase: jest.Mocked<CreateUserUseCase>;
    let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
    let getUserByIdUseCase: jest.Mocked<GetUserByIdUseCase>;
    let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
    let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

    const createUserDto = {
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        type: UserType.USER,
    };

    beforeEach(async () => {
        const mockCreateUserUseCase = {
            execute: jest.fn(),
        };

        const mockListUsersUseCase = {
            execute: jest.fn(),
        };

        const mockGetUserByIdUseCase = {
            execute: jest.fn(),
        };

        const mockUpdateUserUseCase = {
            execute: jest.fn(),
        };

        const mockDeleteUserUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: CreateUserUseCase,
                    useValue: mockCreateUserUseCase,
                },
                {
                    provide: ListUsersUseCase,
                    useValue: mockListUsersUseCase,
                },
                {
                    provide: GetUserByIdUseCase,
                    useValue: mockGetUserByIdUseCase,
                },
                {
                    provide: UpdateUserUseCase,
                    useValue: mockUpdateUserUseCase,
                },
                {
                    provide: DeleteUserUseCase,
                    useValue: mockDeleteUserUseCase,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        createUserUseCase = module.get(CreateUserUseCase);
        listUsersUseCase = module.get(ListUsersUseCase);
        getUserByIdUseCase = module.get(GetUserByIdUseCase);
        updateUserUseCase = module.get(UpdateUserUseCase);
        deleteUserUseCase = module.get(DeleteUserUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const mockUser = UserFixture.getUserEntity({
                name: createUserDto.name,
                email: createUserDto.email,
                passwordHash: createUserDto.password,
            });

            createUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.createUser(createUserDto);

            expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual({
                statusCode: 201,
                data: UserMapper.toDto(mockUser),
            });
        });

        it('should throw an error if the user creation fails', async () => {
            createUserUseCase.execute.mockRejectedValue(new Error('User creation failed'));

            await expect(controller.createUser(createUserDto)).rejects.toThrow('User creation failed');
        });
    });

    describe('listUsers', () => {
        it('should return list of users', async () => {
            const mockUsers = [
                UserFixture.getUserEntity({
                    name: 'User 1',
                    email: 'user1@example.com',
                    passwordHash: 'hashedPassword1',
                }),
                UserFixture.getUserEntity({
                    name: 'User 2',
                    email: 'user2@example.com',
                    passwordHash: 'hashedPassword2',
                }),
            ];

            listUsersUseCase.execute.mockResolvedValue(mockUsers);

            const result = await controller.listUsers();

            expect(listUsersUseCase.execute).toHaveBeenCalled();
            expect(result).toEqual({
                statusCode: 200,
                data: mockUsers.map(user => UserMapper.toDto(user)),
            });
        });
    });

    describe('getUserById', () => {
        it('should return user by id', async () => {
            const userId = 'user-id-1';
            const mockUser = UserFixture.getUserEntity({
                id: userId,
                name: 'testuser',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
            });

            getUserByIdUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.getUserById(userId);

            expect(getUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                statusCode: 200,
                data: UserMapper.toDto(mockUser),
            });
        });

        it('should throw an error if the user is not found', async () => {
            getUserByIdUseCase.execute.mockRejectedValue(new Error('User not found'));

            await expect(controller.getUserById('non-existent-id')).rejects.toThrow('User not found');
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const userId = 'user-id-1';
            const updateUserDto = {
                name: 'newname',
                password: 'newpassword123',
            };

            const mockUser = UserFixture.getUserEntity({
                id: userId,
                name: updateUserDto.name,
                email: 'test@example.com',
                passwordHash: 'newhashedpassword',
            });

            updateUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.updateUser(userId, updateUserDto);

            expect(updateUserUseCase.execute).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual({
                statusCode: 200,
                data: UserMapper.toDto(mockUser),
            });
        });

        it('should update user with partial data', async () => {
            const userId = 'user-id-1';
            const updateUserDto = {
                name: 'newname',
            };

            const mockUser = UserFixture.getUserEntity({
                id: userId,
                name: updateUserDto.name,
                email: 'test@example.com',
                passwordHash: 'hashedpassword',
            });

            updateUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.updateUser(userId, updateUserDto);

            expect(updateUserUseCase.execute).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual({
                statusCode: 200,
                data: UserMapper.toDto(mockUser),
            });
        });

        it('should throw an error if the user is not found', async () => {
            updateUserUseCase.execute.mockRejectedValue(new Error('User not found'));

            await expect(controller.updateUser('non-existent-id', { name: 'newname' })).rejects.toThrow('User not found');
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const userId = 'user-id-1';

            deleteUserUseCase.execute.mockResolvedValue(undefined);

            const result = await controller.deleteUser(userId);

            expect(deleteUserUseCase.execute).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                statusCode: 200,
                message: 'User deleted successfully',
            });
        });

        it('should throw an error if the user is not found', async () => {
            deleteUserUseCase.execute.mockRejectedValue(new Error('User not found'));

            await expect(controller.deleteUser('non-existent-id')).rejects.toThrow('User not found');
        });
    });
});
