import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/domain/repositories/user';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { CreateUserDto } from '@user/domain/dtos/user';

describe('@user/domain/repositories/user', () => {
    let userRepository: jest.Mocked<UserRepository>;
    let userProps: any;
    let user: User;

    beforeEach(() => {
        userProps = UserFixture.getUserProps({
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
        });
        user = UserFixture.getUserEntity(userProps);

        userRepository = createMock<UserRepository>();
    });

    describe('#create', () => {
        it('should create a new user successfully', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newuser',
                email: 'newuser@example.com',
                passwordHash: 'hashedpassword456',
            };

            jest.spyOn(userRepository, 'create').mockResolvedValue(user);

            const result = await userRepository.create(createUserDto);

            expect(result).toBeInstanceOf(User);
            expect(result.id).toBe(userProps.id);
            expect(result.username).toBe(userProps.username);
            expect(result.email).toBe(userProps.email);
            expect(result.passwordHash).toBe(userProps.passwordHash);
            expect(userRepository.create).toHaveBeenNthCalledWith(1, createUserDto);
        });

        it('should handle creation errors', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newuser',
                email: 'newuser@example.com',
                passwordHash: 'hashedpassword456',
            };

            const error = new Error('User creation failed');
            jest.spyOn(userRepository, 'create').mockRejectedValue(error);

            await expect(userRepository.create(createUserDto)).rejects.toThrow(
                'User creation failed',
            );
            expect(userRepository.create).toHaveBeenNthCalledWith(1, createUserDto);
        });
    });

    describe('#findAll', () => {
        it('should return all users successfully', async () => {
            const users = [
                UserFixture.getUserEntity({ id: '1', username: 'user1' }),
                UserFixture.getUserEntity({ id: '2', username: 'user2' }),
                UserFixture.getUserEntity({ id: '3', username: 'user3' }),
            ];

            jest.spyOn(userRepository, 'findAll').mockResolvedValue(users);

            const result = await userRepository.findAll();

            expect(result).toHaveLength(3);
            expect(result[0]).toBeInstanceOf(User);
            expect(result[1]).toBeInstanceOf(User);
            expect(result[2]).toBeInstanceOf(User);
            expect(result[0].username).toBe('user1');
            expect(result[1].username).toBe('user2');
            expect(result[2].username).toBe('user3');
            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should return empty array when no users exist', async () => {
            jest.spyOn(userRepository, 'findAll').mockResolvedValue([]);

            const result = await userRepository.findAll();

            expect(result).toHaveLength(0);
            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should handle findAll errors', async () => {
            const error = new Error('Database connection failed');
            jest.spyOn(userRepository, 'findAll').mockRejectedValue(error);

            await expect(userRepository.findAll()).rejects.toThrow(
                'Database connection failed',
            );
            expect(userRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('#findByUsername', () => {
        it('should return a user when found by username', async () => {
            jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(user);

            const result = await userRepository.findByUsername('testuser');

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(userProps.id);
            expect(result?.username).toBe(userProps.username);
            expect(result?.email).toBe(userProps.email);
            expect(result?.passwordHash).toBe(userProps.passwordHash);
            expect(userRepository.findByUsername).toHaveBeenNthCalledWith(
                1,
                'testuser',
            );
        });

        it('should return null when user is not found', async () => {
            jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);

            const result = await userRepository.findByUsername('nonexistentuser');

            expect(result).toBeNull();
            expect(userRepository.findByUsername).toHaveBeenNthCalledWith(
                1,
                'nonexistentuser',
            );
        });
    });

    describe('#delete', () => {
        it('should delete a user successfully and return true', async () => {
            jest.spyOn(userRepository, 'delete').mockResolvedValue(true);

            const result = await userRepository.delete('123');

            expect(result).toBe(true);
            expect(userRepository.delete).toHaveBeenNthCalledWith(1, '123');
        });

        it('should return false when user does not exist for deletion', async () => {
            jest.spyOn(userRepository, 'delete').mockResolvedValue(false);

            const result = await userRepository.delete('nonexistent');

            expect(result).toBe(false);
            expect(userRepository.delete).toHaveBeenNthCalledWith(1, 'nonexistent');
        });

        it('should handle delete errors', async () => {
            const error = new Error('Delete operation failed');
            jest.spyOn(userRepository, 'delete').mockRejectedValue(error);

            await expect(userRepository.delete('123')).rejects.toThrow(
                'Delete operation failed',
            );
            expect(userRepository.delete).toHaveBeenNthCalledWith(1, '123');
        });
    });
});
