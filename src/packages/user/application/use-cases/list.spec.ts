import { Test } from '@nestjs/testing';
import { ListUsersUseCase } from './list';
import { UserRepository } from '@user/domain/repositories/user';
import { createMock } from '@test/utils/mocks';
import { UserFixture } from '@test/fixture/user';

describe('@user/application/use-cases/list', () => {
    let useCase: ListUsersUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        mockUserRepository = createMock<UserRepository>({});

        const moduleRef = await Test.createTestingModule({
            providers: [
                ListUsersUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = moduleRef.get<ListUsersUseCase>(ListUsersUseCase);
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

            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            const result = await useCase.execute();

            expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUsers);
        });

        it('should return empty array when no users exist', async () => {
            mockUserRepository.findAll.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });
    });
});
