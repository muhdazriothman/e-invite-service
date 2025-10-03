import {
    ConflictException,
    InternalServerErrorException,
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
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import {
    User,
    UserType,
} from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';

describe('@user/application/use-cases/create-admin', () => {
    const userId = '000000000000000000000001';

    let useCase: CreateAdminUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockUserService: jest.Mocked<UserService>;

    const admin = UserFixture.getEntity({
        id: userId,
        type: UserType.ADMIN,
        capabilities: null,
        paymentId: null,
    });

    const createAdminDto: CreateAdminDto = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateAdminUseCase,
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

        useCase = module.get<CreateAdminUseCase>(CreateAdminUseCase);
        mockUserRepository = module.get(UserRepository);
        mockUserService = module.get(UserService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        let mockValidateSameEmailExists: jest.SpyInstance;
        let mockHash: jest.SpyInstance;
        let spyCreateNewAdmin: jest.SpyInstance;

        beforeEach(() => {
            mockValidateSameEmailExists = jest.spyOn(
                mockUserService,
                'validateSameEmailExists',
            ).mockResolvedValue();

            mockHash = jest.spyOn(
                HashService,
                'hash',
            ).mockResolvedValue('hashed_password');

            spyCreateNewAdmin = jest.spyOn(
                User,
                'createNewAdmin',
            );

            mockUserRepository.create.mockResolvedValue(admin);
        });

        it('should create a new admin user when email does not exist', async () => {
            const result = await useCase.execute(
                createAdminDto,
            );

            expect(mockValidateSameEmailExists).toHaveBeenCalledWith(
                createAdminDto.email,
            );

            expect(mockHash).toHaveBeenCalledWith(createAdminDto.password);

            const hashedPassword = await mockHash.mock.results[0].value;

            expect(spyCreateNewAdmin).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createAdminDto.name,
                    email: createAdminDto.email,
                    passwordHash: hashedPassword,
                    type: UserType.ADMIN,
                    paymentId: null,
                }),
            );

            const createNewAdminResult = spyCreateNewAdmin.mock.results[0].value;

            expect(mockUserRepository.create).toHaveBeenCalledWith(
                createNewAdminResult,
            );

            expect(result).toEqual(admin);
        });

        it('should handle ConflictException', async () => {
            mockValidateSameEmailExists.mockRejectedValue(
                new ConflictException(userErrors.EMAIL_ALREADY_EXISTS),
            );

            await expect(useCase.execute(createAdminDto)).rejects.toThrow(
                new ConflictException(userErrors.EMAIL_ALREADY_EXISTS),
            );
        });

        it('should handle unexpected error', async () => {
            mockValidateSameEmailExists.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(createAdminDto)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });

    });
});
