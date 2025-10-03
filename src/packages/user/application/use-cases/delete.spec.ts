import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { userErrors } from '@shared/constants/error-codes';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { UserService } from '@user/application/services/user';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { UserRepository } from '@user/infra/repository';

describe('@user/application/use-cases/delete', () => {
    const userId = '000000000000000000000001';

    let useCase: DeleteUserUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockUserService: jest.Mocked<UserService>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteUserUseCase,
                {
                    provide: UserRepository,
                    useValue: createMock<UserRepository>(),
                },
                {
                    provide: UserService,
                    useValue: createMock<UserService>(),
                },
            ],
        }).compile();

        useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
        mockUserRepository = module.get(UserRepository);
        mockUserService = module.get(UserService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        let mockFindByIdOrFail: jest.SpyInstance;
        let mockDeleteUser: jest.SpyInstance;

        beforeEach(() => {
            mockFindByIdOrFail = jest.spyOn(
                mockUserService,
                'findByIdOrFail',
            ).mockResolvedValue(user);

            mockDeleteUser = jest.spyOn(
                useCase,
                'deleteUser',
            ).mockResolvedValue();

            mockUserRepository.deleteById.mockResolvedValue(true);
        });

        it('should delete a user when user exists', async () => {
            await useCase.execute(userId);

            expect(mockFindByIdOrFail).toHaveBeenCalledWith(userId);
            expect(mockDeleteUser).toHaveBeenCalledWith(userId);
        });

        it('should handle NotFoundException when user does not exist', async () => {
            mockFindByIdOrFail.mockRejectedValue(
                new NotFoundException(userErrors.NOT_FOUND),
            );

            await expect(useCase.execute(userId)).rejects.toThrow(
                new NotFoundException(userErrors.NOT_FOUND),
            );

            expect(mockDeleteUser).not.toHaveBeenCalled();
        });

        it('should handle unexpected error', async () => {
            mockFindByIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(userId)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );

            expect(mockDeleteUser).not.toHaveBeenCalled();
        });
    });

    describe('deleteUser', () => {
        beforeEach(() => {
            mockUserRepository.deleteById.mockResolvedValue(true);
        });

        it('should delete user successfully when user exists', async () => {
            await useCase.deleteUser(userId);

            expect(mockUserRepository.deleteById).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockUserRepository.deleteById.mockResolvedValue(false);

            await expect(useCase.deleteUser(userId)).rejects.toThrow(
                new NotFoundException(userErrors.NOT_FOUND),
            );

            expect(mockUserRepository.deleteById).toHaveBeenCalledWith(userId);
        });
    });
});
