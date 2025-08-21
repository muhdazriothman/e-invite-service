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
import { UserFixture } from '@test/fixture/user';

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
            const createUserData = UserFixture.getUserEntity({
                name: 'newuser',
                email: 'newuser@example.com',
                passwordHash: '$2b$10$hashedpassword',
            });

            const result = await userRepository.create(createUserData);

            expect(result).toBeInstanceOf(User);
            expect(result.id).toBeDefined();
            expect(result.name).toBe('newuser');
            expect(result.email).toBe('newuser@example.com');
            expect(result.passwordHash).toBe('$2b$10$hashedpassword');
            expect(result.isDeleted).toBe(false);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.deletedAt).toBeNull();

            // Verify the user was actually saved to the database
            const savedUser = await userModel.findOne({ name: 'newuser' }).lean();
            expect(savedUser).toBeDefined();
            expect(savedUser?.name).toBe('newuser');
            expect(savedUser?.email).toBe('newuser@example.com');
        });

        it('should create multiple users with different data', async () => {
            const createUserData1 = UserFixture.getUserEntity({
                name: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            });

            const createUserData2 = UserFixture.getUserEntity({
                name: 'user2',
                email: 'user2@example.com',
                passwordHash: '$2b$10$hash2',
            });

            const result1 = await userRepository.create(createUserData1);
            const result2 = await userRepository.create(createUserData2);

            expect(result1).toBeInstanceOf(User);
            expect(result2).toBeInstanceOf(User);
            expect(result1.id).not.toBe(result2.id);
            expect(result1.name).toBe('user1');
            expect(result2.name).toBe('user2');

            // Verify both users were saved
            const savedUsers = await userModel.find({}).lean();
            expect(savedUsers).toHaveLength(2);
        });
    });

    describe('#findAll', () => {
        it('should return all non-deleted users', async () => {
            // Create test users
            const createUserData1 = UserFixture.getUserEntity({
                name: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            });

            const createUserData2 = UserFixture.getUserEntity({
                name: 'user2',
                email: 'user2@example.com',
                passwordHash: '$2b$10$hash2',
            });

            await userRepository.create(createUserData1);
            await userRepository.create(createUserData2);

            const result = await userRepository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(User);
            expect(result[1]).toBeInstanceOf(User);
            expect(result[0].name).toBe('user1');
            expect(result[1].name).toBe('user2');
        });

        it('should return empty array when no users exist', async () => {
            const result = await userRepository.findAll();

            expect(result).toEqual([]);
        });

        it('should exclude deleted users from results', async () => {
            // Create a user
            const createUserData = UserFixture.getUserEntity({
                name: 'user1',
                email: 'user1@example.com',
                passwordHash: '$2b$10$hash1',
            });

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('#findByName', () => {
        it('should return a user when found by name', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            });

            await userRepository.create(createUserData);

            const result = await userRepository.findByName('admin');

            expect(result).toBeInstanceOf(User);
            expect(result?.name).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when user is not found', async () => {
            const result = await userRepository.findByName('nonexistentuser');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            // Create a user
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findByName('admin');

            expect(result).toBeNull();
        });
    });

    describe('#findByEmail', () => {
        it('should return a user when found by email', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            });

            await userRepository.create(createUserData);

            const result = await userRepository.findByEmail('admin@example.com');

            expect(result).toBeInstanceOf(User);
            expect(result?.name).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when user is not found', async () => {
            const result = await userRepository.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            // Create a user
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findByEmail('admin@example.com');

            expect(result).toBeNull();
        });
    });

    describe('#findById', () => {
        it('should return a user when found by id', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC',
            });

            const createdUser = await userRepository.create(createUserData);

            const result = await userRepository.findById(createdUser.id);

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(createdUser.id);
            expect(result?.name).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when user is not found', async () => {
            const result = await userRepository.findById(new Types.ObjectId().toString());

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            // Create a user
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            const result = await userRepository.findById(user.id);

            expect(result).toBeNull();
        });
    });

    describe('#update', () => {
        it('should update user password hash successfully', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$oldhash',
            });

            const user = await userRepository.create(createUserData);
            const originalUpdatedAt = user.updatedAt;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            const newPasswordHash = '$2b$10$newhash';
            const result = await userRepository.update(user.id, {
                passwordHash: newPasswordHash,
            });

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(user.id);
            expect(result?.name).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe(newPasswordHash);
            expect(result?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

            // Verify the update was persisted
            const updatedUser = await userRepository.findByName('admin');
            expect(updatedUser?.passwordHash).toBe(newPasswordHash);
        });

        it('should return null when user does not exist', async () => {
            const result = await userRepository.update(
                new Types.ObjectId().toString(),
                { passwordHash: '$2b$10$newhash' }
            );

            expect(result).toBeNull();
        });

        it('should return null when user is deleted', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);

            // Delete the user
            await userRepository.delete(user.id);

            // Try to update deleted user
            const result = await userRepository.update(user.id, {
                passwordHash: '$2b$10$newhash',
            });

            expect(result).toBeNull();
        });

        it('should update only specified fields', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$oldhash',
            });

            const user = await userRepository.create(createUserData);
            const originalEmail = user.email;
            const originalName = user.name;

            const newPasswordHash = '$2b$10$newhash';
            const result = await userRepository.update(user.id, {
                passwordHash: newPasswordHash,
            });

            expect(result).toBeInstanceOf(User);
            expect(result?.passwordHash).toBe(newPasswordHash);
            expect(result?.email).toBe(originalEmail);
            expect(result?.name).toBe(originalName);
        });

        it('should update name successfully', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);
            const originalUpdatedAt = user.updatedAt;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            const newName = 'newadmin';
            const result = await userRepository.update(user.id, {
                name: newName,
            });

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(user.id);
            expect(result?.name).toBe(newName);
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$hash');
            expect(result?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

            // Verify the update was persisted
            const updatedUser = await userRepository.findById(user.id);
            expect(updatedUser?.name).toBe(newName);
        });



        it('should update name and password successfully', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$oldhash',
            });

            const user = await userRepository.create(createUserData);
            const originalUpdatedAt = user.updatedAt;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            const newName = 'newadmin';
            const newPasswordHash = '$2b$10$newhash';
            const result = await userRepository.update(user.id, {
                name: newName,
                passwordHash: newPasswordHash,
            });

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(user.id);
            expect(result?.name).toBe(newName);
            expect(result?.email).toBe('admin@example.com'); // email should remain unchanged
            expect(result?.passwordHash).toBe(newPasswordHash);
            expect(result?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

            // Verify the update was persisted
            const updatedUser = await userRepository.findById(user.id);
            expect(updatedUser?.name).toBe(newName);
            expect(updatedUser?.email).toBe('admin@example.com'); // email should remain unchanged
            expect(updatedUser?.passwordHash).toBe(newPasswordHash);
        });
    });

    describe('#delete', () => {
        it('should mark a user as deleted', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);

            const result = await userRepository.delete(user.id);

            expect(result).toBe(true);

            // Verify the user is marked as deleted
            const deletedUser = await userRepository.findByName('admin');
            expect(deletedUser).toBeNull();
        });

        it('should return false when user does not exist', async () => {
            const result = await userRepository.delete(new Types.ObjectId().toString());

            expect(result).toBe(false);
        });

        it('should return false when user is already deleted', async () => {
            const createUserData = UserFixture.getUserEntity({
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: '$2b$10$hash',
            });

            const user = await userRepository.create(createUserData);

            // Delete the user first time
            await userRepository.delete(user.id);

            // Try to delete again
            const result = await userRepository.delete(user.id);

            expect(result).toBe(false);
        });
    });
});
