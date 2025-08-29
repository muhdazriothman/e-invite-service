import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { UserController } from '@user/interfaces/http/controller';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { UpdateUserDto } from '@user/interfaces/http/dtos/update';
import { UserType, PlanType } from '@user/domain/entities/user';
import { UserFixture } from '@test/fixture/user';

describe('@user/interfaces/http/controller', () => {
    let controller: UserController;
    let createUserUseCase: jest.Mocked<CreateUserUseCase>;
    let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
    let getUserByIdUseCase: jest.Mocked<GetUserByIdUseCase>;
    let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
    let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

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
        it('should create a user successfully', async () => {
            const createUserDto: CreateUserDto = {
                name: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                type: UserType.USER,
                planType: PlanType.BASIC,
            };

            const mockUser = UserFixture.getUserEntity({
                id: '000000000000000000000001',
                name: createUserDto.name,
                email: createUserDto.email,
                type: createUserDto.type,
            });

            createUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.createUser(createUserDto);

            expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);

            expect(result).toEqual({
                message: 'User created successfully',
                data: {
                    id: mockUser.id,
                    name: mockUser.name,
                    email: mockUser.email,
                    plan: {
                        type: mockUser.plan.type,
                        invitationLimit: mockUser.plan.invitationLimit,
                        name: mockUser.plan.name,
                        description: mockUser.plan.description,
                    },
                    createdAt: mockUser.createdAt.toISOString(),
                    updatedAt: mockUser.updatedAt.toISOString(),
                },
            });
        });

        it('should handle user creation failure', async () => {
            const createUserDto: CreateUserDto = {
                name: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                type: UserType.USER,
                planType: PlanType.BASIC,
            };

            createUserUseCase.execute.mockRejectedValue(new Error('User creation failed'));

            await expect(controller.createUser(createUserDto)).rejects.toThrow('User creation failed');
        });
    });

    describe('listUsers', () => {
        it('should return all users successfully', async () => {
            const mockUsers = [
                UserFixture.getUserEntity({
                    id: '000000000000000000000001',
                    name: 'User 1',
                }),
                UserFixture.getUserEntity({
                    id: '000000000000000000000002',
                    name: 'User 2',
                }),
            ];

            listUsersUseCase.execute.mockResolvedValue(mockUsers);

            const result = await controller.listUsers();

            expect(listUsersUseCase.execute).toHaveBeenCalled();
            expect(result).toEqual({
                message: 'Users retrieved successfully',
                data: mockUsers.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    plan: {
                        type: user.plan.type,
                        invitationLimit: user.plan.invitationLimit,
                        name: user.plan.name,
                        description: user.plan.description,
                    },
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                })),
            });
        });
    });

    describe('getUserById', () => {
        it('should return a user by ID successfully', async () => {
            const userId = '000000000000000000000001';
            const mockUser = UserFixture.getUserEntity({
                id: userId,
                name: 'Test User',
            });

            getUserByIdUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.getUserById(userId);

            expect(getUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                message: 'User retrieved successfully',
                data: {
                    id: mockUser.id,
                    name: mockUser.name,
                    email: mockUser.email,
                    plan: {
                        type: mockUser.plan.type,
                        invitationLimit: mockUser.plan.invitationLimit,
                        name: mockUser.plan.name,
                        description: mockUser.plan.description,
                    },
                    createdAt: mockUser.createdAt.toISOString(),
                    updatedAt: mockUser.updatedAt.toISOString(),
                },
            });
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            const userId = '000000000000000000000001';
            const updateUserDto: UpdateUserDto = {
                name: 'Updated User',
                password: 'newpassword123',
            };

            const mockUser = UserFixture.getUserEntity({
                id: userId,
                name: updateUserDto.name,
            });

            updateUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.updateUser(userId, updateUserDto);

            expect(updateUserUseCase.execute).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual({
                message: 'User updated successfully',
                data: {
                    id: mockUser.id,
                    name: mockUser.name,
                    email: mockUser.email,
                    plan: {
                        type: mockUser.plan.type,
                        invitationLimit: mockUser.plan.invitationLimit,
                        name: mockUser.plan.name,
                        description: mockUser.plan.description,
                    },
                    createdAt: mockUser.createdAt.toISOString(),
                    updatedAt: mockUser.updatedAt.toISOString(),
                },
            });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            const userId = 'user-id-1';

            deleteUserUseCase.execute.mockResolvedValue(undefined);

            const result = await controller.deleteUser(userId);

            expect(deleteUserUseCase.execute).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                message: 'User deleted successfully',
            });
        });
    });
});
