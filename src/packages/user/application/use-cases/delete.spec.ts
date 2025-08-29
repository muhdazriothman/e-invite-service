import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete';
import { UserRepository } from '@user/infra/repository';
import {
    User,
    UserType,
    PlanType,
} from '@user/domain/entities/user';
import { PlanConfig } from '@user/domain/value-objects/plan-config';

describe('@user/application/use-cases/delete', () => {
    let useCase: DeleteUserUseCase;
    let mockRepository: jest.Mocked<UserRepository>;

    const mockUser = User.createFromDb({
        id: 'user-id-1',
        name: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        type: UserType.USER,
        plan: PlanConfig.create(PlanType.BASIC),
        isDeleted: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        deletedAt: null,
    });

    beforeEach(async () => {
        const mockUserRepository = {
            findById: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteUserUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
        mockRepository = module.get('UserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should delete user successfully', async () => {
            const userId = 'user-id-1';

            mockRepository.findById.mockResolvedValue(mockUser);
            mockRepository.delete.mockResolvedValue(true);

            await expect(useCase.execute(userId)).resolves.toBeUndefined();

            expect(mockRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 'non-existent-id';

            mockRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when delete operation fails', async () => {
            const userId = 'user-id-1';

            mockRepository.findById.mockResolvedValue(mockUser);
            mockRepository.delete.mockResolvedValue(false);

            await expect(useCase.execute(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(userId);
        });
    });
});
