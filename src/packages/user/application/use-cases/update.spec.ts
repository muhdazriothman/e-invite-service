import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { userErrors } from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { UserService } from '@user/application/services/user';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { UserRepository } from '@user/infra/repository';
import { UpdateUserDto } from '@user/interfaces/http/dtos/update';

describe('@user/application/use-cases/update', () => {
    const userId = '000000000000000000000001';

    let useCase: UpdateUserUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockUserService: jest.Mocked<UserService>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    const updateUserDto: UpdateUserDto = {
        name: 'newname',
        password: 'newpassword',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateUserUseCase,
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

        useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
        mockUserRepository = module.get(UserRepository);
        mockUserService = module.get(UserService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        let mockFindByIdOrFail: jest.SpyInstance;
        let mockHash: jest.SpyInstance;

        beforeEach(() => {
            mockFindByIdOrFail = jest.spyOn(
                mockUserService,
                'findByIdOrFail',
            ).mockResolvedValue(user);

            mockHash = jest.spyOn(
                HashService,
                'hash',
            ).mockResolvedValue('hashed_password');

            mockUserRepository.updateById.mockResolvedValue(user);
        });

        it('should update user successfully', async () => {
            const result = await useCase.execute(userId, updateUserDto);

            expect(mockFindByIdOrFail).toHaveBeenCalledWith(userId);

            expect(mockHash).toHaveBeenCalledWith(updateUserDto.password);

            const hashedPassword = await mockHash.mock.results[0].value;

            expect(mockUserRepository.updateById).toHaveBeenCalledWith(userId, {
                name: updateUserDto.name,
                passwordHash: hashedPassword,
            });
            expect(result).toEqual(user);
        });

        it('should handle NotFoundException when user does not exist', async () => {
            mockFindByIdOrFail.mockRejectedValue(
                new NotFoundException(userErrors.NOT_FOUND),
            );

            await expect(useCase.execute(userId, updateUserDto)).rejects.toThrow(
                new NotFoundException(userErrors.NOT_FOUND),
            );
        });

        it('should handle unexpected error', async () => {
            mockFindByIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(userId, updateUserDto)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });
});
