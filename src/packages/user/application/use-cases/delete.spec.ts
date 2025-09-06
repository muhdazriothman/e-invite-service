import { NotFoundException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import { UserType } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

import { DeleteUserUseCase } from '@user/application/use-cases/delete';

describe('@user/application/use-cases/delete', () => {
    let useCase: DeleteUserUseCase;
    let mockRepository: jest.Mocked<UserRepository>;

    const mockUser = UserFixture.getEntity({
        id: 'user-id-1',
        name: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        type: UserType.USER,
        paymentId: 'payment-id-123',
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

            await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
            expect(mockRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when delete operation fails', async () => {
            const userId = 'user-id-1';

            mockRepository.findById.mockResolvedValue(mockUser);
            mockRepository.delete.mockResolvedValue(false);

            await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
            expect(mockRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(userId);
        });
    });
});
