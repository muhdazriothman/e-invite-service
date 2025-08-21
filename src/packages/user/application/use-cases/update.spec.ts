import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update';
import { UserRepository } from '@user/infra/repository';
import { HashService } from '@common/services/hash';
import { User, UserType } from '@user/domain/entities/user';

describe('@user/application/use-cases/update', () => {
    let useCase: UpdateUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let hashService: jest.Mocked<HashService>;

    const mockUser = User.createFromDb({
        id: 'user-id-1',
        name: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        type: UserType.USER,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateUserUseCase,
                {
                    provide: 'UserRepository',
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: 'HashService',
                    useValue: {
                        hash: jest.fn(),
                    },
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
        it('should update name successfully', async () => {
            const userId = 'user-id-1';
            const updateData = { name: 'newname' };
            const updatedUser = { ...mockUser, name: 'newname' };

            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).toHaveBeenCalledWith(userId, { name: 'newname' });
            expect(result).toEqual(updatedUser);
        });

        it('should update password successfully', async () => {
            const userId = 'user-id-1';
            const updateData = { password: 'newpassword123' };
            const hashedPassword = 'newhashedpassword';
            const updatedUser = { ...mockUser, passwordHash: hashedPassword };

            userRepository.findById.mockResolvedValue(mockUser);
            hashService.hash.mockResolvedValue(hashedPassword);
            userRepository.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(hashService.hash).toHaveBeenCalledWith('newpassword123');
            expect(userRepository.update).toHaveBeenCalledWith(userId, { passwordHash: hashedPassword });
            expect(result).toEqual(updatedUser);
        });

        it('should update both name and password successfully', async () => {
            const userId = 'user-id-1';
            const updateData = {
                name: 'newname',
                password: 'newpassword123',
            };
            const hashedPassword = 'newhashedpassword';
            const updatedUser = {
                ...mockUser,
                name: 'newname',
                passwordHash: hashedPassword,
            };

            userRepository.findById.mockResolvedValue(mockUser);
            hashService.hash.mockResolvedValue(hashedPassword);
            userRepository.update.mockResolvedValue(updatedUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(hashService.hash).toHaveBeenCalledWith('newpassword123');
            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                name: 'newname',
                passwordHash: hashedPassword,
            });
            expect(result).toEqual(updatedUser);
        });

        it('should return existing user when no updates provided', async () => {
            const userId = 'user-id-1';
            const updateData = {};

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).not.toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should not update if name is the same', async () => {
            const userId = 'user-id-1';
            const updateData = { name: 'testuser' };

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await useCase.execute(userId, updateData);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).not.toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 'non-existent-id';
            const updateData = { name: 'newname' };

            userRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(userId, updateData)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when update operation fails to return the updated user', async () => {
            const userId = 'user-id-1';
            const updateData = { name: 'newname' };

            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue(null);

            await expect(useCase.execute(userId, updateData)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });
    });
});
