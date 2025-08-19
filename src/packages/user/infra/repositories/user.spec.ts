import { User } from '@user/domain/entities/user';
import { UserRepositoryImpl } from '@user/infra/repositories/user';
import {
    UserMongoSchema,
    UserMongoModelName,
} from '@user/infra/schemas/user';
import { CreateUserDto } from '@user/domain/dtos/user';
import { Types } from 'mongoose';
import { TestingModule } from '@nestjs/testing';
import {
    setupRepositoryTest,
    cleanCollections,
    MongoTestSetup,
} from '@test/utils/mongo-test-setup';

describe('@user/infra/repositories/user', () => {
    let userRepository: UserRepositoryImpl;
    let connection: any;
    let module: TestingModule;

    beforeAll(async () => {
        const testContext = await setupRepositoryTest(
            [{ name: UserMongoModelName, schema: UserMongoSchema }],
            [UserRepositoryImpl]
        );

        connection = testContext.connection;
        module = testContext.module;
        userRepository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
    });

    afterAll(async () => {
        await module.close();
        await MongoTestSetup.stop();
    });

    beforeEach(async () => {
        // Clear the collection before each test
        await cleanCollections(['users']);
    });

    describe('#create', () => {
        it('should create a new user successfully', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newuser',
                email: 'newuser@example.com',
                passwordHash: '$2b$10$hashedpassword',
            };

            const result = await userRepository.create(createUserDto);

            expect(result).toBeInstanceOf(User);
            expect(result.id).toBeDefined();
            expect(result.username).toBe('newuser');
            expect(result.email).toBe('newuser@example.com');
            expect(result.passwordHash).toBe('$2b$10$hashedpassword');
            expect(result.isDeleted).toBe(false);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.deletedAt).toBeNull();

            // Verify the user was actually saved to the database
            const savedUser = await connection.collection('users').findOne({ username: 'newuser' });
            expect(savedUser).toBeDefined();
            expect(savedUser?.username).toBe('newuser');
            expect(savedUser?.email).toBe('newuser@example.com');
        });

        it('should create multiple users with different data', async () => {
            const createUserDto1: CreateUserDto = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const createUserDto2: CreateUserDto = {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: '$2b$10$hash2',
            };

            const result1 = await userRepository.create(createUserDto1);
            const result2 = await userRepository.create(createUserDto2);

            expect(result1).toBeInstanceOf(User);
            expect(result2).toBeInstanceOf(User);
            expect(result1.id).not.toBe(result2.id);
            expect(result1.username).toBe('user1');
            expect(result2.username).toBe('user2');

            // Verify both users were saved
            const savedUsers = await connection.collection('users').find({}).toArray();
            expect(savedUsers).toHaveLength(2);
        });
    });

    describe('#findAll', () => {
        it('should return all non-deleted users', async () => {
            // Create test users
            const createUserDto1: CreateUserDto = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const createUserDto2: CreateUserDto = {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: '$2b$10$hash2',
            };

            await userRepository.create(createUserDto1);
            await userRepository.create(createUserDto2);

            const result = await userRepository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(User);
            expect(result[1]).toBeInstanceOf(User);
            expect(result[0].username).toBe('user1');
            expect(result[1].username).toBe('user2');
        });

        it('should return empty array when no users exist', async () => {
            const result = await userRepository.findAll();

            expect(result).toEqual([]);
        });

        it('should exclude deleted users from results', async () => {
            // Create a user
            const createUserDto: CreateUserDto = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const user = await userRepository.create(createUserDto);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('#findByUsername', () => {
        it('should return a user when found by username', async () => {
            const createUserDto: CreateUserDto = {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            };

            await userRepository.create(createUserDto);

            const result = await userRepository.findByUsername('admin');

            expect(result).toBeInstanceOf(User);
            expect(result?.username).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when user is not found', async () => {
            const result = await userRepository.findByUsername('nonexistentuser');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            // Create a user
            const createUserDto: CreateUserDto = {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            };

            const user = await userRepository.create(createUserDto);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findByUsername('admin');

            expect(result).toBeNull();
        });
    });

    describe('#delete', () => {
        it('should soft delete a user successfully', async () => {
            const createUserDto: CreateUserDto = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const user = await userRepository.create(createUserDto);

            const result = await userRepository.delete(user.id);

            expect(result).toBe(true);

            // Verify the user is soft deleted
            const deletedUser = await userRepository.findByUsername('user1');
            expect(deletedUser).toBeNull();

            // Verify the user still exists in database but is marked as deleted
            const dbUser = await connection.collection('users').findOne({ _id: new Types.ObjectId(user.id) });
            expect(dbUser?.isDeleted).toBe(true);
            expect(dbUser?.deletedAt).toBeInstanceOf(Date);
        });

        it('should return false when user is not found', async () => {
            const result = await userRepository.delete(new Types.ObjectId().toString());

            expect(result).toBe(false);
        });

        it('should return false when user is already deleted', async () => {
            const createUserDto: CreateUserDto = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const user = await userRepository.create(createUserDto);

            // Delete the user first time
            await userRepository.delete(user.id);

            // Try to delete again
            const result = await userRepository.delete(user.id);

            expect(result).toBe(false);
        });
    });
});
