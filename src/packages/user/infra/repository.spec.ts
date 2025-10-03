import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import {
    MongoTestSetup,
    setupRepositoryTest,
} from '@test/utils/mongo-test-setup';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import {
    UserLean,
    UserHydrated,
    UserMongoModelName,
    UserMongoSchema,
} from '@user/infra/schema';
import {
    Model,
    Types,
} from 'mongoose';

describe('@user/infra/repository', () => {
    let repository: UserRepository;
    let userModel: Model<UserHydrated>;
    let module: TestingModule;

    let spyToDomain: jest.SpyInstance;

    beforeAll(async () => {
        const testContext = await setupRepositoryTest(
            [{
                name: UserMongoModelName,
                schema: UserMongoSchema,
            }],
            [UserRepository],
        );

        module = testContext.module;
        repository = module.get<UserRepository>(UserRepository);
        userModel = module.get<Model<UserHydrated>>(
            getModelToken(UserMongoModelName),
        );
    });

    beforeEach(() => {
        spyToDomain = jest.spyOn(UserRepository, 'toDomain');
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await module.close();
        await MongoTestSetup.stop();
    });

    describe('#toDomain', () => {
        let spyCreateFromDb: jest.SpyInstance;

        beforeEach(() => {
            spyCreateFromDb = jest.spyOn(User, 'createFromDb');
        });

        it('should convert MongoDB document to domain entity correctly', () => {
            const document = UserFixture.getLean();

            const result = UserRepository.toDomain(document);

            expect(spyCreateFromDb).toHaveBeenCalledWith(document);

            expect(result).toBeInstanceOf(User);
            expect(result).toMatchObject({
                id: document._id?.toString(),
                name: document.name,
                email: document.email,
                passwordHash: document.passwordHash,
                type: document.type,
                capabilities: document.capabilities,
                paymentId: document.paymentId?.toString(),
                isDeleted: document.isDeleted,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                deletedAt: document.deletedAt,
            });
        });
    });

    describe('#toDocument', () => {
        it('should convert domain entity to MongoDB document correctly', () => {
            const user = UserFixture.getEntity();
            const document = UserRepository.toDocument(
                user,
                userModel,
            );

            expect(document).toBeInstanceOf(userModel);
            expect(document).toMatchObject({
                _id: expect.any(Types.ObjectId),
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: new Types.ObjectId(user.paymentId!),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isDeleted: user.isDeleted,
                deletedAt: user.deletedAt,
            });
        });
    });

    describe('#create', () => {
        it('should create a new user successfully', async () => {
            const user = UserFixture.getEntity();

            const result = await repository.create(user);

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: new Types.ObjectId(result.id),
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: new Types.ObjectId(user.paymentId!),
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: user.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as User;

            expect(result).toBeInstanceOf(User);
            expect(result).toMatchObject(toDomainResult);

            const createdUser = await userModel
                .findOne(
                    {
                        _id: result.id,
                    },
                )
                .lean<UserLean>();

            expect(createdUser).toMatchObject({
                _id: new Types.ObjectId(result.id),
                name: result.name,
                email: result.email,
                passwordHash: result.passwordHash,
                type: result.type,
                capabilities: result.capabilities,
                paymentId: new Types.ObjectId(result.paymentId!),
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                isDeleted: result.isDeleted,
                deletedAt: result.deletedAt,
            });
        });
    });

    describe('#findAll', () => {
        it('should return users', async () => {
            const user1 = UserFixture.getLean({
                id: '000000000000000000000001',
                name: 'user1',
                email: 'user1@example.com',
            });

            const user2 = UserFixture.getLean({
                id: '000000000000000000000002',
                name: 'user2',
                email: 'user2@example.com',
            });

            await userModel.create([user1, user2]);

            const result = await repository.findAll();

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: user1._id,
                name: user1.name,
                email: user1.email,
                passwordHash: user1.passwordHash,
                type: user1.type,
                capabilities: user1.capabilities,
                paymentId: user1.paymentId,
                isDeleted: user1.isDeleted,
                createdAt: user1.createdAt,
                updatedAt: user1.updatedAt,
                deletedAt: user1.deletedAt,
            });

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: user2._id,
                name: user2.name,
                email: user2.email,
                passwordHash: user2.passwordHash,
                type: user2.type,
                capabilities: user2.capabilities,
                paymentId: user2.paymentId,
                isDeleted: user2.isDeleted,
                createdAt: user2.createdAt,
                updatedAt: user2.updatedAt,
                deletedAt: user2.deletedAt,
            });

            const toDomainResult1 = spyToDomain.mock.results[0].value as User;
            const toDomainResult2 = spyToDomain.mock.results[1].value as User;

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(User);
            expect(result[0]).toMatchObject(toDomainResult1);
            expect(result[1]).toBeInstanceOf(User);
            expect(result[1]).toMatchObject(toDomainResult2);
        });

        it('should return empty array when no users exist', async () => {
            const result = await repository.findAll();

            expect(result).toEqual([]);
        });

        it('should exclude deleted users from results', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('#findByName', () => {
        it('should return a user when found by name', async () => {
            const user = UserFixture.getLean();
            await userModel.create(user);

            const result = await repository.findByName(user.name);

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: user._id,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: user.paymentId,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: user.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as User;

            expect(result).toBeInstanceOf(User);
            expect(result).toMatchObject(toDomainResult);
        });

        it('should return null when user is not found', async () => {
            const result = await repository.findByName('nonexistentuser');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.findByName(user.name);

            expect(result).toBeNull();
        });
    });

    describe('#findByEmail', () => {
        it('should return a user when found by email', async () => {
            const user = UserFixture.getLean();
            await userModel.create(user);

            const result = await repository.findByEmail(user.email);

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: user._id,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: user.paymentId,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: user.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as User;

            expect(result).toBeInstanceOf(User);
            expect(result).toMatchObject(toDomainResult);
        });

        it('should return null when user is not found', async () => {
            const result = await repository.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });

        it('should exclude deleted users from search', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.findByEmail(user.email);

            expect(result).toBeNull();
        });

        it('should return null when user is not found', async () => {
            const result = await repository.findByEmail(
                'nonexistent@example.com',
            );

            expect(result).toBeNull();
        });

        it('should return null when user is deleted', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.findByEmail(user.email);

            expect(result).toBeNull();
        });
    });

    describe('#findById', () => {
        it('should return a user when found by id', async () => {
            const user = UserFixture.getLean();
            await userModel.create(user);

            const result = await repository.findById(user._id.toString());

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: user._id,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: user.paymentId,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: user.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as User;

            expect(result).toBeInstanceOf(User);
            expect(result).toMatchObject(toDomainResult);
        });

        it('should return null when user is not found', async () => {
            const result = await repository.findById(
                '000000000000000000000001',
            );

            expect(result).toBeNull();
        });

        it('should return null when user is deleted', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.findById(user._id.toString());

            expect(result).toBeNull();
        });
    });

    describe('#updateById', () => {
        const updates = {
            name: 'new_admin',
            passwordHash: '$2b$10$newhash',
        };

        it('should update user successfully', async () => {
            const user = UserFixture.getLean({
                name: 'old_admin',
                passwordHash: '$2b$10$oldhash',
            });
            await userModel.create(user);

            const result = await repository.updateById(
                user._id.toString(),
                updates,
            );

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: user._id,
                name: updates.name,
                email: user.email,
                passwordHash: updates.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: user.paymentId,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: expect.any(Date),
                deletedAt: user.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as User;

            expect(result).toBeInstanceOf(User);
            expect(result).toMatchObject(toDomainResult);

            const updatedUser = await userModel.findOne({
                _id: user._id,
            }).lean<UserLean>();

            expect(updatedUser).toMatchObject({
                _id: user._id,
                name: updates.name,
                email: user.email,
                passwordHash: updates.passwordHash,
                type: user.type,
                capabilities: user.capabilities,
                paymentId: user.paymentId,
                createdAt: user.createdAt,
                updatedAt: expect.any(Date),
                isDeleted: user.isDeleted,
                deletedAt: user.deletedAt,
            });

            expect(updatedUser?.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
        });

        it('should return null when user does not exist', async () => {
            const result = await repository.updateById(
                '000000000000000000000001',
                updates,
            );

            expect(result).toBeNull();
        });

        it('should return null when user is deleted', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.updateById(
                user._id.toString(),
                updates,
            );

            expect(result).toBeNull();
        });
    });

    describe('#deleteById', () => {
        it('should mark a user as deleted', async () => {
            const user = UserFixture.getLean();
            await userModel.create(user);

            const result = await repository.deleteById(
                user._id.toString(),
            );

            expect(result).toBe(true);

            const updatedInvitation = await userModel.findOne({
                _id: user._id,
            }).lean<UserLean>();

            expect(updatedInvitation?.isDeleted).toBe(true);
            expect(updatedInvitation?.deletedAt?.getTime()).toBeGreaterThan(user.deletedAt?.getTime() ?? 0);
            expect(updatedInvitation?.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
        });

        it('should return false when user does not exist', async () => {
            const result = await repository.deleteById(
                '000000000000000000000001',
            );

            expect(result).toBe(false);
        });

        it('should return false when user is already deleted', async () => {
            const user = UserFixture.getLean({
                isDeleted: true,
            });
            await userModel.create(user);

            const result = await repository.deleteById(
                user._id.toString(),
            );

            expect(result).toBe(false);
        });
    });
});
