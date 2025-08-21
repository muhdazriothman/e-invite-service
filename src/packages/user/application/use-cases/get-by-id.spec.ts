import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from './get-by-id';
import { UserRepository } from '@user/infra/repository';
import { User, UserType } from '@user/domain/entities/user';

describe('@user/application/use-cases/get-by-id', () => {
    let useCase: GetUserByIdUseCase;
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
                GetUserByIdUseCase,
                {
                    provide: 'UserRepository',
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
        userRepository = module.get('UserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return user when found', async () => {
            const userId = 'user-id-1';
            userRepository.findById.mockResolvedValue(mockUser);

            const result = await useCase.execute(userId);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 'non-existent-id';
            userRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });
    });
});
