import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from './get-by-id';
import { UserRepository } from '@user/infra/repository';
import { UserType } from '@user/domain/entities/user';
import { UserFixture } from '@test/fixture/user';

describe('@user/application/use-cases/get-by-id', () => {
    let useCase: GetUserByIdUseCase;
    let mockRepository: jest.Mocked<UserRepository>;

    const mockUser = UserFixture.getUserEntity({
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
