import { User } from '@user/domain/entities/user';
import { UserRepositoryImpl } from '@user/infra/repositories/user';
import { Model } from 'mongoose';
import { UserMongoDocument } from '@user/infra/schemas/user';
import { createMock } from '@test/utils/mocks';

describe('@user/infra/repositories/user', () => {
    let userRepository: UserRepositoryImpl;
    let mockModel: jest.Mocked<Model<UserMongoDocument>>;

    beforeEach(() => {
        mockModel = createMock<Model<UserMongoDocument>>({
            findOne: jest
                .fn()
                .mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
            create: jest.fn(),
            updateOne: jest.fn(),
        });
        userRepository = new UserRepositoryImpl(mockModel);
    });

    describe('#findByUsername', () => {
        it('should return a user when found by username', async () => {
            const mockDate = new Date('2023-01-01');
            (mockModel.findOne as jest.Mock).mockReturnValueOnce({
                lean: jest.fn().mockResolvedValue({
                    _id: '1',
                    username: 'admin',
                    email: 'admin@example.com',
                    passwordHash:
                        '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
                    isDeleted: false,
                    createdAt: mockDate,
                    updatedAt: mockDate,
                    deletedAt: null,
                }),
            });

            const result = await userRepository.findByUsername('admin');

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe('1');
            expect(result?.username).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe(
                '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            );
            expect(result?.isDeleted).toBe(false);
            expect(result?.createdAt).toBe(mockDate);
            expect(result?.updatedAt).toBe(mockDate);
            expect(result?.deletedAt).toBeNull();
        });

        it('should return null when user is not found', async () => {
            (mockModel.findOne as jest.Mock).mockReturnValueOnce({
                lean: jest.fn().mockResolvedValue(null),
            });

            const result = await userRepository.findByUsername('nonexistentuser');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            await userRepository.findByUsername('admin');

            expect(mockModel.findOne).toHaveBeenCalledWith({
                username: 'admin',
                isDeleted: false,
            });
        });
    });

    describe('#delete', () => {
        it('should soft delete a user successfully', async () => {
            (mockModel.updateOne as jest.Mock).mockResolvedValueOnce({
                modifiedCount: 1,
            });

            const result = await userRepository.delete('1');

            expect(result).toBe(true);
            expect(mockModel.updateOne).toHaveBeenCalledWith(
                { _id: '1', isDeleted: false },
                { isDeleted: true, deletedAt: expect.any(Date), updatedAt: expect.any(Date) }
            );
        });

        it('should return false when user is not found or already deleted', async () => {
            (mockModel.updateOne as jest.Mock).mockResolvedValueOnce({
                modifiedCount: 0,
            });

            const result = await userRepository.delete('1');

            expect(result).toBe(false);
        });
    });
});
