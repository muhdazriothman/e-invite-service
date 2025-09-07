import { ConflictException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { HashService } from '@shared/services/hash';
import { UserFixture } from '@test/fixture/user';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { UserType } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';

describe('@user/application/use-cases/create-admin', () => {
    let useCase: CreateAdminUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let hashService: jest.Mocked<HashService>;

    const adminUser = UserFixture.getAdminUser();

    beforeEach(async() => {
        const mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const mockHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateAdminUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: 'HashService',
                    useValue: mockHashService,
                },
            ],
        }).compile();

        useCase = module.get<CreateAdminUseCase>(CreateAdminUseCase);
        userRepository = module.get('UserRepository');
        hashService = module.get('HashService');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const createAdminDto: CreateAdminDto = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
        };

        it('should create a new admin user when email does not exist', async() => {
            const hashedPassword = 'hashed_password';

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(adminUser);
            hashService.hash.mockResolvedValue(hashedPassword);

            const result = await useCase.execute(createAdminDto);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                createAdminDto.email,
            );
            expect(hashService.hash).toHaveBeenCalledWith(createAdminDto.password);
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createAdminDto.name,
                    email: createAdminDto.email,
                    passwordHash: hashedPassword,
                    type: UserType.ADMIN,
                    capabilities: null,
                    paymentId: null,
                }),
            );
            expect(result).toEqual(adminUser);
        });

        it('should throw ConflictException when email already exists', async() => {
            const existingUser = UserFixture.getEntity({
                id: '1',
                name: 'existinguser',
                email: createAdminDto.email,
                passwordHash: 'existingHash',
                type: UserType.USER,
            });

            userRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(useCase.execute(createAdminDto)).rejects.toThrow(
                ConflictException,
            );
            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                createAdminDto.email,
            );
            expect(hashService.hash).not.toHaveBeenCalled();
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});
