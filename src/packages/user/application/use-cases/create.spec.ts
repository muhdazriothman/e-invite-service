import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create';
import { UserRepository } from '@user/infra/repository';
import { UserType } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { HashService } from '@common/services/hash';
import { UserFixture } from '@test/fixture/user';

describe('@user/application/use-cases/create', () => {
    let useCase: CreateUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let hashService: jest.Mocked<HashService>;

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findByEmail: jest.fn(),
            delete: jest.fn(),
        };

        const mockHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
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

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        userRepository = module.get('UserRepository');
        hashService = module.get('HashService');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const createUserDto: CreateUserDto = {
            name: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.USER,
        };

        it('should create a new user when email does not exist', async () => {
            const hashedPassword = 'hashedPassword123';
            const expectedUser = UserFixture.getUserEntity({
                id: '1',
                name: createUserDto.name,
                email: createUserDto.email,
                passwordHash: hashedPassword,
                type: createUserDto.type,
            });

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(expectedUser);
            hashService.hash.mockResolvedValue(hashedPassword);

            const result = await useCase.execute(createUserDto);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createUserDto.name,
                    email: createUserDto.email,
                    passwordHash: hashedPassword,
                    type: createUserDto.type,
                })
            );
            expect(result).toEqual(expectedUser);
        });

        it('should throw ConflictException when email already exists', async () => {
            const existingUser = UserFixture.getUserEntity({
                id: '1',
                name: 'existinguser',
                email: createUserDto.email,
                passwordHash: 'existingHash',
                type: UserType.USER,
            });

            userRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(useCase.execute(createUserDto)).rejects.toThrow(ConflictException);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});

