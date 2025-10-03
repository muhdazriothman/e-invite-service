import {
    ConflictException,
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
import { UserRepository } from '@user/infra/repository';

describe('@user/application/services/user', () => {
    const userId = '000000000000000000000001';
    const email = 'testuser@example.com';

    let service: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    const user = UserFixture.getEntity({
        id: userId,
        email,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: createMock<UserRepository>(),
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        mockUserRepository = module.get(UserRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('#validateSameEmailExists', () => {
        beforeEach(() => {
            mockUserRepository.findByEmail.mockResolvedValue(null);
        });

        it('should not throw when user with same email does not exist', async () => {
            await expect(service.validateSameEmailExists(
                email,
            )).resolves.toBeUndefined();

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                email,
            );
        });

        it('should throw ConflictException when email already exists', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(user);

            await expect(service.validateSameEmailExists(
                email,
            )).rejects.toThrow(
                new ConflictException(
                    userErrors.EMAIL_ALREADY_EXISTS,
                ),
            );

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                email,
            );
        });
    });

    describe('#findByIdOrFail', () => {
        beforeEach(() => {
            mockUserRepository.findById.mockResolvedValue(user);
        });

        it('should return user when user exists', async () => {
            const result = await service.findByIdOrFail(userId);

            expect(result).toEqual(user);
            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.findByIdOrFail(userId)).rejects.toThrow(
                new NotFoundException(userErrors.NOT_FOUND),
            );

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
        });
    });
});
