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
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { UserType } from '@user/domain/entities/user';

describe('@user/application/use-cases/get-by-id', () => {
    const userId = '000000000000000000000001';

    let useCase: GetUserByIdUseCase;
    let mockUserService: jest.Mocked<UserService>;

    const user = UserFixture.getEntity({
        id: userId,
        type: UserType.USER,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserByIdUseCase,
                {
                    provide: UserService,
                    useValue: createMock<UserService>(),
                },
            ],
        }).compile();

        useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
        mockUserService = module.get(UserService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        let mockFindByIdOrFail: jest.SpyInstance;

        beforeEach(() => {
            mockFindByIdOrFail = jest.spyOn(
                mockUserService,
                'findByIdOrFail',
            ).mockResolvedValue(user);
        });

        it('should return user when found', async () => {
            const result = await useCase.execute(userId);

            expect(mockFindByIdOrFail).toHaveBeenCalledWith(userId);
            expect(result).toEqual(user);
        });

        it('should handle NotFoundException when user does not exist', async () => {
            mockFindByIdOrFail.mockRejectedValue(
                new NotFoundException(userErrors.NOT_FOUND),
            );

            await expect(useCase.execute(userId)).rejects.toThrow(
                new NotFoundException(userErrors.NOT_FOUND),
            );
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
        });
    });
});
