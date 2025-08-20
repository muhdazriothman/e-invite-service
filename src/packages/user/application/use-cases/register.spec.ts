import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register';
import { UserRepository } from '@user/infra/repository';
import { User } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { HashService } from '@common/services/hash';
import { UserFixture } from '@test/fixture/user';

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;
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
                RegisterUserUseCase,
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

        useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
        userRepository = module.get('UserRepository');
        hashService = module.get('HashService');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        const registerDto: CreateUserDto = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'strongpass',
        };

        it('should create a new user and return the user entity', async () => {
            userRepository.findByUsername.mockResolvedValue(null);
            hashService.hash.mockResolvedValue('hashed_password');

            const createdUser = UserFixture.getNewUser();
            userRepository.create.mockResolvedValue(createdUser);

            const result = await useCase.execute(registerDto);

            expect(userRepository.findByUsername).toHaveBeenCalledWith(
                registerDto.username,
            );
            expect(hashService.hash).toHaveBeenCalledWith(registerDto.password);
            expect(userRepository.create).toHaveBeenCalledWith({
                username: registerDto.username,
                email: registerDto.email,
                passwordHash: 'hashed_password',
            });
            expect(result).toBe(createdUser);
            expect(result).toBeInstanceOf(User);
        });

        it('should throw ConflictException when username already exists', async () => {
            const existingUser = UserFixture.getUserEntity({
                username: registerDto.username,
                email: 'another@example.com',
                passwordHash: 'hash',
            });
            userRepository.findByUsername.mockResolvedValue(existingUser);

            await expect(useCase.execute(registerDto)).rejects.toThrow(
                new ConflictException('User already exists'),
            );

            expect(userRepository.findByUsername).toHaveBeenCalledWith(
                registerDto.username,
            );
            expect(hashService.hash).not.toHaveBeenCalled();
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});
