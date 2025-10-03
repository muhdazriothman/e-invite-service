import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { UserController } from '@user/interfaces/http/controllers/user';
import { UserMapper } from '@user/interfaces/http/mapper';

describe('@user/interfaces/http/controllers/user', () => {
    const userId = '000000000000000000000001';

    let controller: UserController;
    let createUserUseCase: jest.Mocked<CreateUserUseCase>;
    let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
    let getUserByIdUseCase: jest.Mocked<GetUserByIdUseCase>;
    let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
    let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: CreateUserUseCase,
                    useValue: createMock<CreateUserUseCase>(),
                },
                {
                    provide: ListUsersUseCase,
                    useValue: createMock<ListUsersUseCase>(),
                },
                {
                    provide: GetUserByIdUseCase,
                    useValue: createMock<GetUserByIdUseCase>(),
                },
                {
                    provide: UpdateUserUseCase,
                    useValue: createMock<UpdateUserUseCase>(),
                },
                {
                    provide: DeleteUserUseCase,
                    useValue: createMock<DeleteUserUseCase>(),
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

    describe('#createUser', () => {
        const createDto = UserFixture.getCreateDto();

        it('should create a new user', async () => {
            createUserUseCase.execute.mockResolvedValue(user);

            const result = await controller.createUser(createDto);

            expect(createUserUseCase.execute).toHaveBeenCalledWith(createDto);
            expect(result).toEqual({
                message: 'User created successfully',
                data: UserMapper.toDto(user),
            });
        });

        it('should throw an error if the user creation fails', async () => {
            createUserUseCase.execute.mockRejectedValue(
                new Error('User creation failed'),
            );

            await expect(controller.createUser(createDto)).rejects.toThrow(
                'User creation failed',
            );
        });
    });

    describe('#listUsers', () => {
        it('should return all users successfully', async () => {
            const users = [
                UserFixture.getEntity({
                    id: '000000000000000000000001',
                }),
                UserFixture.getEntity({
                    id: '000000000000000000000002',
                }),
            ];

            listUsersUseCase.execute.mockResolvedValue(users);

            const result = await controller.listUsers();

            expect(listUsersUseCase.execute).toHaveBeenCalled();
            expect(result).toEqual({
                message: 'Users retrieved successfully',
                data: users.map(UserMapper.toDto),
            });
        });

        it('should throw an error if the list users fails', async () => {
            listUsersUseCase.execute.mockRejectedValue(
                new Error('Failed to retrieve users'),
            );

            await expect(controller.listUsers()).rejects.toThrow(
                'Failed to retrieve users',
            );
        });
    });

    describe('#getUserById', () => {
        it('should return user by id', async () => {
            getUserByIdUseCase.execute.mockResolvedValue(user);

            getUserByIdUseCase.execute.mockResolvedValue(user);

            const result = await controller.getUserById(userId);

            expect(getUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                message: 'User retrieved successfully',
                data: UserMapper.toDto(user),
            });
        });

        it('should throw an error if the user is not found', async () => {
            getUserByIdUseCase.execute.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.getUserById('non-existent-id')).rejects.toThrow(
                'User not found',
            );
        });
    });

    describe('#updateUser', () => {
        const updateDto = UserFixture.getUpdateDto();

        it('should update user successfully', async () => {
            updateUserUseCase.execute.mockResolvedValue(user);

            const result = await controller.updateUser(
                userId,
                updateDto,
            );

            expect(updateUserUseCase.execute).toHaveBeenCalledWith(
                userId,
                updateDto,
            );

            expect(result).toEqual({
                message: 'User updated successfully',
                data: UserMapper.toDto(user),
            });
        });

        it('should throw an error if the user is not found', async () => {
            updateUserUseCase.execute.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(
                controller.updateUser('non-existent-id', updateDto),
            ).rejects.toThrow('User not found');
        });
    });

    describe('#deleteUser', () => {
        it('should delete user successfully', async () => {
            deleteUserUseCase.execute.mockResolvedValue(undefined);

            const result = await controller.deleteUser(userId);

            expect(deleteUserUseCase.execute).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                message: 'User deleted successfully',
            });
        });

        it('should throw an error if the user is not found', async () => {
            deleteUserUseCase.execute.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.deleteUser('non-existent-id')).rejects.toThrow(
                'User not found',
            );
        });
    });
});
