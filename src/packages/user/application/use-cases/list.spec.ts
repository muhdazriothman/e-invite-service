import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list';
import { UserRepository } from '@user/infra/repository';
import { UserFixture } from '@test/fixture/user';

describe('ListUsersUseCase', () => {
    let useCase: ListUsersUseCase;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUsername: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListUsersUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
        userRepository = module.get('UserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return all users from repository', async () => {
            const mockUsers = [
                UserFixture.getUserEntity({
                    id: '1',
                    username: 'user1',
                    email: 'user1@example.com',
                    passwordHash: 'hash1',
                }),
                UserFixture.getUserEntity({
                    id: '2',
                    username: 'user2',
                    email: 'user2@example.com',
                    passwordHash: 'hash2',
                }),
            ];

            userRepository.findAll.mockResolvedValue(mockUsers);

            const result = await useCase.execute();

            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUsers);
        });

        it('should return empty array when no users exist', async () => {
            userRepository.findAll.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });
    });
});
