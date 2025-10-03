import { InternalServerErrorException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UserType } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

describe('@user/application/use-cases/list', () => {
    let useCase: ListUsersUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;

    const users = [
        UserFixture.getEntity({
            id: '000000000000000000000001',
            type: UserType.USER,
        }),
        UserFixture.getEntity({
            id: '000000000000000000000002',
            type: UserType.USER,
        }),
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListUsersUseCase,
                {
                    provide: UserRepository,
                    useValue: createMock<UserRepository>(),
                },
            ],
        }).compile();

        useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
        mockUserRepository = module.get(UserRepository);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        beforeEach(() => {
            mockUserRepository.findAll.mockResolvedValue(users);
        });

        it('should return all users from repository', async () => {
            const result = await useCase.execute();

            expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(users);
        });

        it('should handle unexpected error', async () => {
            mockUserRepository.findAll.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute()).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });
});
