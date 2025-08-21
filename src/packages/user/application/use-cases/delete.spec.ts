import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete';
import { UserRepository } from '@user/infra/repository';
import { User, UserType } from '@user/domain/entities/user';

describe('@user/application/use-cases/delete', () => {
    let useCase: DeleteUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;

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
                DeleteUserUseCase,
                {
                    provide: 'UserRepository',
                    useValue: {
                        findById: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
        userRepository = module.get('UserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should delete user successfully', async () => {
            const userId = 'user-id-1';

            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.delete.mockResolvedValue(true);

            await expect(useCase.execute(userId)).resolves.toBeUndefined();

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.delete).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 'non-existent-id';

            userRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when delete operation fails', async () => {
            const userId = 'user-id-1';

            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.delete.mockResolvedValue(false);

            await expect(useCase.execute(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.delete).toHaveBeenCalledWith(userId);
        });
    });
});
