import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { RegisterUseCase } from './register';
import { RegisterDto } from '@user/interfaces/http/dtos/register';
import { UserRepository } from '@user/domain/repositories/user';
import { HashService } from '@user/application/interfaces/hash-service';
import { UserFixture } from '@test/fixture/user';
import { User } from '@user/domain/entities/user';
import { createMock } from '@test/utils/mocks';

describe('@user/application/use-cases/register', () => {
    let registerUseCase: RegisterUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockHashService: jest.Mocked<HashService>;

    beforeEach(async () => {
        mockUserRepository = createMock<UserRepository>({});
        mockHashService = createMock<HashService>({});

        const moduleRef = await Test.createTestingModule({
            providers: [
                RegisterUseCase,
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

        registerUseCase = moduleRef.get<RegisterUseCase>(RegisterUseCase);
    });

    it('should be defined', () => {
        expect(registerUseCase).toBeDefined();
    });

    describe('#execute', () => {
        const registerDto: RegisterDto = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'strongpass',
        };

        it('should create a new user and return the user entity', async () => {
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockHashService.hash.mockResolvedValue('hashed_password');

            const createdUser = UserFixture.getNewUser();
            mockUserRepository.create.mockResolvedValue(createdUser);

            const result = await registerUseCase.execute(registerDto);

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
                registerDto.username,
            );
            expect(mockHashService.hash).toHaveBeenCalledWith(registerDto.password);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
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
            mockUserRepository.findByUsername.mockResolvedValue(existingUser);

            await expect(registerUseCase.execute(registerDto)).rejects.toThrow(
                new ConflictException('Username already exists'),
            );

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
                registerDto.username,
            );
            expect(mockHashService.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });
    });
});
