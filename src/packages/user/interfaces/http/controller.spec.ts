import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './controller';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { User } from '@user/domain/entities/user';
import { UserMapper } from '@user/interfaces/http/mapper';

describe('@user/interfaces/http/controller', () => {
    let controller: UserController;
    let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
    let createUserUseCase: jest.Mocked<CreateUserUseCase>;

    beforeEach(async () => {
        const mockListUsersUseCase = {
            execute: jest.fn(),
        };

        const mockCreateUserUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: ListUsersUseCase,
                    useValue: mockListUsersUseCase,
                },
                {
                    provide: CreateUserUseCase,
                    useValue: mockCreateUserUseCase,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        listUsersUseCase = module.get(ListUsersUseCase);
        createUserUseCase = module.get(CreateUserUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const createUserDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            };

            const mockUser = new User({
                id: '1',
                username: createUserDto.username,
                email: createUserDto.email,
                passwordHash: 'hashedPassword123',
            });

            createUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.createUser(createUserDto);

            expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual({
                statusCode: 201,
                data: UserMapper.toDto(mockUser),
            });
        });
    });

    describe('listUsers', () => {
        it('should return list of users', async () => {
            const mockUsers = [
                new User({
                    id: '1',
                    email: 'user1@example.com',
                    passwordHash: 'hashedPassword1',
                    username: 'User 1',
                }),
                new User({
                    id: '2',
                    email: 'user2@example.com',
                    passwordHash: 'hashedPassword2',
                    username: 'User 2',
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
});
