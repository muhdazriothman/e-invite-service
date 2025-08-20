import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create';
import { UserRepository } from '@user/infra/repository';
import { User, UserType } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { HashService } from '@common/services/hash';

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let hashService: jest.Mocked<HashService>;

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUsername: jest.fn(),
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
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.USER,
        };

        it('should create a new user when username does not exist', async () => {
            const hashedPassword = 'hashedPassword123';
            const expectedUser = new User({
                id: '1',
                username: createUserDto.username,
                email: createUserDto.email,
                passwordHash: hashedPassword,
                type: createUserDto.type,
            });

            userRepository.findByUsername.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(expectedUser);
            hashService.hash.mockResolvedValue(hashedPassword);

            const result = await useCase.execute(createUserDto);

            expect(userRepository.findByUsername).toHaveBeenCalledWith(createUserDto.username);
            expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
            expect(userRepository.create).toHaveBeenCalledWith({
                username: createUserDto.username,
                email: createUserDto.email,
                passwordHash: hashedPassword,
                type: createUserDto.type,
            });
            expect(result).toEqual(expectedUser);
        });

        it('should throw ConflictException when username already exists', async () => {
            const existingUser = new User({
                id: '1',
                username: createUserDto.username,
                email: 'existing@example.com',
                passwordHash: 'existingHash',
                type: UserType.USER,
            });

            userRepository.findByUsername.mockResolvedValue(existingUser);

            await expect(useCase.execute(createUserDto)).rejects.toThrow(ConflictException);
            expect(userRepository.findByUsername).toHaveBeenCalledWith(createUserDto.username);
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});

