import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import {
    UserMongoSchema,
    UserMongoModelName,
    UserMongoDocument,
} from '@user/infra/schema';
import { Types, Model } from 'mongoose';
import { TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
    setupRepositoryTest,
    MongoTestSetup,
} from '@test/utils/mongo-test-setup';

describe('@user/infra/repositories/user', () => {
    let userRepository: UserRepository;
    let userModel: Model<UserMongoDocument>;
    let module: TestingModule;

    beforeAll(async () => {
        const testContext = await setupRepositoryTest(
            [{ name: UserMongoModelName, schema: UserMongoSchema }],
            [UserRepository]
        );

        module = testContext.module;
        userRepository = module.get<UserRepository>(UserRepository);
        userModel = module.get<Model<UserMongoDocument>>(getModelToken(UserMongoModelName));
    });

    afterAll(async () => {
        await module.close();
        await MongoTestSetup.stop();
    });

    beforeEach(async () => {
        await userModel.deleteMany({});
    });

    describe('#create', () => {
        it('should create a new user successfully', async () => {
            const createUserData = {
                username: 'newuser',
                email: 'newuser@example.com',
                passwordHash: '$2b$10$hashedpassword',
            };

            const result = await userRepository.create(createUserData);

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
            const savedUser = await userModel.findOne({ username: 'newuser' }).lean();
            expect(savedUser).toBeDefined();
            expect(savedUser?.username).toBe('newuser');
            expect(savedUser?.email).toBe('newuser@example.com');
        });

        it('should create multiple users with different data', async () => {
            const createUserData1 = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const createUserData2 = {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: '$2b$10$hash2',
            };

            const result1 = await userRepository.create(createUserData1);
            const result2 = await userRepository.create(createUserData2);

            expect(result1).toBeInstanceOf(User);
            expect(result2).toBeInstanceOf(User);
            expect(result1.id).not.toBe(result2.id);
            expect(result1.username).toBe('user1');
            expect(result2.username).toBe('user2');

            // Verify both users were saved
            const savedUsers = await userModel.find({}).lean();
            expect(savedUsers).toHaveLength(2);
        });
    });

    describe('#findAll', () => {
        it('should return all non-deleted users', async () => {
            // Create test users
            const createUserData1 = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const createUserData2 = {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: '$2b$10$hash2',
            };

            await userRepository.create(createUserData1);
            await userRepository.create(createUserData2);

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
            const createUserData = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('#findByUsername', () => {
        it('should return a user when found by username', async () => {
            const createUserData = {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            };

            await userRepository.create(createUserData);

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
            const createUserData = {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            };

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findByUsername('admin');

            expect(result).toBeNull();
        });
    });

    describe('#findByEmail', () => {
        it('should return a user when found by email', async () => {
            const createUserData = {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            };

            await userRepository.create(createUserData);

            const result = await userRepository.findByEmail('admin@example.com');

            expect(result).toBeInstanceOf(User);
            expect(result?.username).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when user is not found by email', async () => {
            const result = await userRepository.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from email search', async () => {
            // Create a user
            const createUserData = {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            };

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findByEmail('admin@example.com');

            expect(result).toBeNull();
        });
    });

    describe('#delete', () => {
        it('should soft delete a user successfully', async () => {
            const createUserData = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const user = await userRepository.create(createUserData);

            const result = await userRepository.delete(user.id);

            expect(result).toBe(true);

            // Verify the user is soft deleted
            const deletedUser = await userRepository.findByUsername('user1');
            expect(deletedUser).toBeNull();

            // Verify the user still exists in database but is marked as deleted
            const dbUser = await userModel.findOne({ _id: new Types.ObjectId(user.id) }).lean();
            expect(dbUser?.isDeleted).toBe(true);
            expect(dbUser?.deletedAt).toBeInstanceOf(Date);
        });

        it('should return false when user is not found', async () => {
            const result = await userRepository.delete(new Types.ObjectId().toString());

            expect(result).toBe(false);
        });

        it('should return false when user is already deleted', async () => {
            const createUserData = {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            };

            const user = await userRepository.create(createUserData);

            // Delete the user first time
            await userRepository.delete(user.id);

            // Try to delete again
            const result = await userRepository.delete(user.id);

            expect(result).toBe(false);
        });
    });
});
