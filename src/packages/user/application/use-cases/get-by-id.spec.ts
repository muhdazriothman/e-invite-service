import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from './get-by-id';
import { UserRepository } from '@user/infra/repository';
import { User, UserType, PlanType } from '@user/domain/entities/user';
import { PlanConfig } from '@user/domain/value-objects/plan-config';

describe('@user/application/use-cases/get-by-id', () => {
    let useCase: GetUserByIdUseCase;
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
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserByIdUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
        mockRepository = module.get('UserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return user when found', async () => {
            mockRepository.findById.mockResolvedValue(mockUser);

            const result = await useCase.execute('user-id-1');

            expect(mockRepository.findById).toHaveBeenCalledWith('user-id-1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
            expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
        });
    });
});
