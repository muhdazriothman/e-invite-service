import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase, UpdateUserRequest } from './update';
import { UserRepository } from '@user/infra/repository';
import { HashService } from '@shared/services/hash';
import { UserFixture } from '@test/fixture/user';

describe('@user/application/use-cases/update', () => {
    let useCase: UpdateUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let hashService: jest.Mocked<HashService>;

    beforeEach(async () => {
        const mockUserRepository = {
            findById: jest.fn(),
            update: jest.fn(),
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
                UpdateUserUseCase,
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

        useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
        userRepository = module.get('UserRepository');
        hashService = module.get('HashService');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const userId = '000000000000000000000001';
        const existingUser = UserFixture.getUserEntity({
            id: userId,
            name: 'originalname',
            email: 'test@example.com',
            passwordHash: 'originalHash',
        });

        it('should update user name when name is provided and different', async () => {
            const updateData: UpdateUserRequest = {
                name: 'newname',
            };

            const updatedUser = UserFixture.getUserEntity({
                id: userId,
                name: 'newname',
                email: 'test@example.com',
                passwordHash: 'originalHash',
            });

            userRepository.findById.mockResolvedValue(existingUser);
            userRepository.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                name: 'newname',
            });
            expect(result).toEqual(updatedUser);
        });

        it('should not update when name is the same as existing', async () => {
            const updateData: UpdateUserRequest = {
                name: 'originalname',
            };

            userRepository.findById.mockResolvedValue(existingUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).not.toHaveBeenCalled();
            expect(result).toEqual(existingUser);
        });

        it('should update password hash when password is provided', async () => {
            const updateData: UpdateUserRequest = {
                password: 'newpassword',
            };

            const newHash = 'newHashedPassword';
            const updatedUser = UserFixture.getUserEntity({
                id: userId,
                name: 'originalname',
                email: 'test@example.com',
                passwordHash: newHash,
            });

            userRepository.findById.mockResolvedValue(existingUser);
            hashService.hash.mockResolvedValue(newHash);
            userRepository.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(hashService.hash).toHaveBeenCalledWith('newpassword');
            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: newHash,
            });
            expect(result).toEqual(updatedUser);
        });


        it('should return existing user without calling update when no updates provided', async () => {
            const updateData: UpdateUserRequest = {};

            userRepository.findById.mockResolvedValue(existingUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).not.toHaveBeenCalled();
            expect(result).toEqual(existingUser);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const updateData: UpdateUserRequest = {
                name: 'newname',
            };

            userRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(userId, updateData)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when repository update returns null', async () => {
            const updateData: UpdateUserRequest = {
                name: 'newname',
            };

            userRepository.findById.mockResolvedValue(existingUser);
            userRepository.update.mockResolvedValue(null);

            await expect(useCase.execute(userId, updateData)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                name: 'newname',
            });
        });
    });
});
