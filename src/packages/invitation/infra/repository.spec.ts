import {
    CelebratedPersonType,
    Invitation,
    InvitationType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    InvitationHydrated,
    InvitationLean,
    InvitationMongoModelName,
    InvitationMongoSchema,
} from '@invitation/infra/schema';
import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { InvitationFixture } from '@test/fixture/invitation';
import {
    MongoTestSetup,
    setupRepositoryTest,
} from '@test/utils/mongo-test-setup';
import {
    Model,
    Types,
} from 'mongoose';

describe('@invitation/infra/repositories/invitation', () => {
    const userId = '000000000000000000000001';

    let repository: InvitationRepository;
    let invitationModel: Model<InvitationHydrated>;
    let module: TestingModule;

    let spyToDomain: jest.SpyInstance;

    beforeAll(async () => {
        const testContext = await setupRepositoryTest([{
            name: InvitationMongoModelName,
            schema: InvitationMongoSchema,
        }], [InvitationRepository]);

        module = testContext.module;
        repository = module.get<InvitationRepository>(InvitationRepository);
        invitationModel = module.get<Model<InvitationHydrated>>(
            getModelToken(InvitationMongoModelName),
        );
    });

    beforeEach(() => {
        spyToDomain = jest.spyOn(InvitationRepository, 'toDomain');
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await invitationModel.deleteMany({});
    });

    afterAll(async () => {
        await module.close();
        await MongoTestSetup.stop();
    });

    describe('#toDomain', () => {
        let spyCreateFromDb: jest.SpyInstance;

        beforeEach(() => {
            spyCreateFromDb = jest.spyOn(Invitation, 'createFromDb');
        });

        it('should convert MongoDB document to domain entity correctly', () => {
            const document = InvitationFixture.getLean({
                userId,
            });

            const result = InvitationRepository.toDomain(document);

            expect(spyCreateFromDb).toHaveBeenCalledWith(document);

            expect(result).toBeInstanceOf(Invitation);
            expect(result).toEqual({
                id: document._id.toString(),
                userId: document.userId,
                type: document.type,
                title: document.title,
                hosts: document.hosts,
                celebratedPersons: document.celebratedPersons,
                date: document.date,
                location: document.location,
                itineraries: document.itineraries,
                contactPersons: document.contactPersons,
                rsvpDueDate: document.rsvpDueDate,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                isDeleted: document.isDeleted,
                deletedAt: document.deletedAt,
            });
        });
    });

    describe('#toDocument', () => {
        it('should convert domain entity to MongoDB document correctly', () => {
            const user = InvitationFixture.getEntity({
                userId,
            });
            const document = InvitationRepository.toDocument(
                user,
                invitationModel,
            );

            expect(document).toBeInstanceOf(invitationModel);
            expect(document).toMatchObject({
                _id: expect.any(Types.ObjectId),
                userId: user.userId,
                type: user.type,
                title: user.title,
                hosts: user.hosts,
                celebratedPersons: user.celebratedPersons,
                date: user.date,
                location: user.location,
                itineraries: user.itineraries,
                contactPersons: user.contactPersons,
                rsvpDueDate: user.rsvpDueDate,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isDeleted: user.isDeleted,
                deletedAt: user.deletedAt,
            });
        });
    });

    describe('#create', () => {
        it('should create a new invitation successfully', async () => {
            const invitation = InvitationFixture.getEntity({
                userId,
            });

            const result = await repository.create(invitation);

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: new Types.ObjectId(result.id),
                userId: invitation.userId,
                type: invitation.type,
                title: invitation.title,
                hosts: invitation.hosts,
                celebratedPersons: invitation.celebratedPersons,
                date: invitation.date,
                location: invitation.location,
                itineraries: invitation.itineraries,
                contactPersons: invitation.contactPersons,
                rsvpDueDate: invitation.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Invitation;

            expect(result).toBeInstanceOf(Invitation);
            expect(result).toBe(toDomainResult);

            const createdInvitation = await invitationModel
                .findOne(
                    {
                        _id: result.id,
                    },
                )
                .lean<InvitationLean>();

            expect(createdInvitation).toMatchObject({
                _id: new Types.ObjectId(result.id),
                userId: invitation.userId,
                type: invitation.type,
                title: invitation.title,
                hosts: invitation.hosts,
                celebratedPersons: invitation.celebratedPersons,
                date: invitation.date,
                location: invitation.location,
                itineraries: invitation.itineraries,
                contactPersons: invitation.contactPersons,
                rsvpDueDate: invitation.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });
        });
    });

    // TODO: standardize the tests
    describe('#findAllWithPagination', () => {
        it('should return paginated invitations with default limit (forward)', async () => {
            // Create multiple invitations
            const invitations: Invitation[] = [];
            for (let i = 0; i < 25; i++) {
                const invitation = InvitationFixture.getEntity({
                    title: `Wedding Celebration ${i + 1}`,
                    type: InvitationType.WEDDING,
                });
                invitations.push(await repository.create(invitation));
            }

            const result = await repository.findAllWithPagination();

            expect(result.data).toHaveLength(20); // default limit
            expect(result.hasNextPage).toBe(true);
            expect(result.hasPreviousPage).toBe(false); // First page
            expect(result.count).toBe(20);
            expect(result.nextCursor).toBeDefined();
            expect(result.previousCursor).toBeUndefined(); // First page has no previous cursor
            expect(result.data[0]).toBeInstanceOf(Invitation);
        });

        it('should return paginated invitations with custom limit (forward)', async () => {
            // Create multiple invitations
            const invitations: Invitation[] = [];
            for (let i = 0; i < 15; i++) {
                const invitation = InvitationFixture.getEntity({
                    title: `Wedding Celebration ${i + 1}`,
                    type: InvitationType.WEDDING,
                });
                invitations.push(await repository.create(invitation));
            }

            const result = await repository.findAllWithPagination(
                undefined,
                undefined,
                undefined,
                10,
            );

            expect(result.data).toHaveLength(10);
            expect(result.hasNextPage).toBe(true);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.count).toBe(10);
            expect(result.nextCursor).toBeDefined();
            expect(result.previousCursor).toBeUndefined(); // First page has no previous cursor
        });

        it('should return paginated invitations with next cursor (forward pagination)', async () => {
            // Create multiple invitations
            const invitations: Invitation[] = [];
            for (let i = 0; i < 15; i++) {
                const invitation = InvitationFixture.getEntity({
                    title: `Wedding Celebration ${i + 1}`,
                    type: InvitationType.WEDDING,
                });
                invitations.push(await repository.create(invitation));
            }

            // Get first page
            const firstPage = await repository.findAllWithPagination(
                undefined,
                undefined,
                undefined,
                5,
            );
            expect(firstPage.data).toHaveLength(5);
            expect(firstPage.hasNextPage).toBe(true);
            expect(firstPage.hasPreviousPage).toBe(false);
            expect(firstPage.nextCursor).toBeDefined();
            expect(firstPage.previousCursor).toBeUndefined(); // First page has no previous cursor

            // Get second page using next cursor
            const secondPage = await repository.findAllWithPagination(
                undefined,
                firstPage.nextCursor,
                undefined,
                5,
            );
            expect(secondPage.data).toHaveLength(5);
            expect(secondPage.data[0].id).not.toBe(firstPage.data[0].id);
            expect(secondPage.hasPreviousPage).toBe(true);
        });

        it('should return paginated invitations with previous cursor (backward pagination)', async () => {
            // Create multiple invitations
            const invitations: Invitation[] = [];
            for (let i = 0; i < 15; i++) {
                const invitation = InvitationFixture.getEntity({
                    title: `Wedding Celebration ${i + 1}`,
                    type: InvitationType.WEDDING,
                });
                invitations.push(await repository.create(invitation));
            }

            // Get first page
            const firstPage = await repository.findAllWithPagination(
                undefined,
                undefined,
                undefined,
                5,
            );

            // Get second page using next cursor
            const secondPage = await repository.findAllWithPagination(
                undefined,
                firstPage.nextCursor,
                undefined,
                5,
            );

            // Go back to first page using previous cursor
            const backToFirstPage = await repository.findAllWithPagination(
                undefined,
                undefined,
                secondPage.previousCursor,
                5,
            );

            expect(backToFirstPage.data).toHaveLength(5);
            expect(backToFirstPage.data[0].id).toBe(firstPage.data[0].id);
            expect(backToFirstPage.hasNextPage).toBe(true);
            expect(backToFirstPage.hasPreviousPage).toBe(false);
        });

        it('should return empty pagination result when no invitations exist', async () => {
            const result = await repository.findAllWithPagination();

            expect(result.data).toEqual([]);
            expect(result.hasNextPage).toBe(false);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.count).toBe(0);
            expect(result.nextCursor).toBeUndefined();
            expect(result.previousCursor).toBeUndefined();
        });

        it('should filter by userId when provided', async () => {
            const user1Invitation = InvitationFixture.getEntity({
                userId: 'user1',
                title: 'User 1 Wedding',
            });
            const user2Invitation = InvitationFixture.getEntity({
                userId: 'user2',
                title: 'User 2 Wedding',
            });

            await repository.create(user1Invitation);
            await repository.create(user2Invitation);

            const result = await repository.findAllWithPagination('user1');

            expect(result.data).toHaveLength(1);
            expect(result.data[0].userId).toBe('user1');
            expect(result.data[0].title).toBe('User 1 Wedding');
        });

        it('should handle invalid next cursor gracefully', async () => {
            // Create an invitation
            const invitation = InvitationFixture.getEntity({
                title: 'Wedding Celebration',
            });
            await repository.create(invitation);

            const result = await repository.findAllWithPagination(
                undefined,
                'invalid-cursor',
            );

            expect(result.data).toHaveLength(1);
            expect(result.hasNextPage).toBe(false);
        });

        it('should handle invalid previous cursor gracefully', async () => {
            // Create an invitation
            const invitation = InvitationFixture.getEntity({
                title: 'Wedding Celebration',
            });
            await repository.create(invitation);

            const result = await repository.findAllWithPagination(
                undefined,
                undefined,
                'invalid-cursor',
            );

            expect(result.data).toHaveLength(1);
            expect(result.hasPreviousPage).toBe(false);
        });
    });

    describe('#findById', () => {
        it('should return an invitation when found by id', async () => {
            const invitation = InvitationFixture.getLean({
                userId,
            });
            await invitationModel.create(invitation);

            const result = await repository.findById(invitation._id.toString());

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: invitation._id,
                userId: invitation.userId,
                type: invitation.type,
                title: invitation.title,
                hosts: invitation.hosts,
                celebratedPersons: invitation.celebratedPersons,
                date: invitation.date,
                location: invitation.location,
                itineraries: invitation.itineraries,
                contactPersons: invitation.contactPersons,
                rsvpDueDate: invitation.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Invitation;

            expect(result).toBeInstanceOf(Invitation);
            expect(result).toEqual(toDomainResult);
        });

        it('should return null when invitation is not found', async () => {
            const result = await repository.findById(
                '000000000000000000000000',
            );

            expect(result).toBeNull();
        });

        it('should return null when invitation is deleted', async () => {
            const invitation = InvitationFixture.getEntity({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.findById(invitation.id);

            expect(result).toBeNull();
        });
    });

    describe('#findByIdAndUserId', () => {
        it('should return an invitation when found by id and userId', async () => {
            const invitation = InvitationFixture.getLean({
                userId,
            });
            await invitationModel.create(invitation);

            const result = await repository.findByIdAndUserId(
                invitation._id.toString(),
                invitation.userId,
            );

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: invitation._id,
                userId: invitation.userId,
                type: invitation.type,
                title: invitation.title,
                hosts: invitation.hosts,
                celebratedPersons: invitation.celebratedPersons,
                date: invitation.date,
                location: invitation.location,
                itineraries: invitation.itineraries,
                contactPersons: invitation.contactPersons,
                rsvpDueDate: invitation.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Invitation;

            expect(result).toBeInstanceOf(Invitation);
            expect(result).toMatchObject(toDomainResult);
        });

        it('should return null when invitation exists but userId does not match', async () => {
            const invitation = InvitationFixture.getEntity({
                userId: '000000000000000000000001',
            });
            await invitationModel.create(invitation);

            const result = await repository.findByIdAndUserId(
                invitation.id,
                '000000000000000000000002',
            );

            expect(result).toBeNull();
        });

        it('should return null when invitation is not found', async () => {
            const result = await repository.findByIdAndUserId(
                '000000000000000000000000',
                '000000000000000000000001',
            );

            expect(result).toBeNull();
        });

        it('should return null when invitation is deleted', async () => {
            const invitation = InvitationFixture.getEntity({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.findByIdAndUserId(
                invitation.id,
                invitation.userId,
            );

            expect(result).toBeNull();
        });
    });

    describe('#countByUserId', () => {
        it('should return the number of invitations for a user', async () => {
            const invitation = InvitationFixture.getEntity({
                userId,
            });
            await invitationModel.create(invitation);

            const result = await repository.countByUserId(
                invitation.userId,
            );

            expect(result).toBe(1);
        });

        it('should return 0 when no invitations exist for a user', async () => {
            const result = await repository.countByUserId(
                '000000000000000000000001',
            );

            expect(result).toBe(0);
        });

        it('should return 0 when invitations are deleted', async () => {
            const invitation = InvitationFixture.getEntity({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.countByUserId(
                invitation.userId,
            );

            expect(result).toBe(0);
        });
    });

    describe('#updateById', () => {
        const updates = {
            type: InvitationType.BIRTHDAY,
            title: 'Birthday Celebration',
            hosts: [
                {
                    name: 'Sushi',
                    title: 'Sushi',
                    relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                    phoneNumber: '+1111111111',
                    email: 'sushi@example.com',
                },
            ],
            celebratedPersons: [
                {
                    name: 'Syamel',
                    title: 'Syamel',
                    relationshipWithHost: RelationshipType.COLLEAGUE,
                    celebrationDate: new Date('2024-06-16'),
                    type: CelebratedPersonType.CHILD,
                },
            ],
            date: {
                gregorianDate: new Date('2024-06-16'),
                hijriDate: '1445-12-09',
            },
            location: {
                address: '123 Birthday Hall, Downtown City',
                wazeLink: 'https://waze.com/ul/1111111111',
                googleMapsLink: 'https://maps.google.com/?q=123+Birthday+Hall',
            },
            itineraries: [
                {
                    activities: ['Games', 'Quizzes', 'Food'],
                    startTime: '10:00',
                    endTime: '15:00',
                },
            ],
            contactPersons: [
                {
                    name: 'Birthday Coordinator',
                    title: 'Birthday Coordinator',
                    relationshipWithCelebratedPerson: RelationshipType.NEIGHBOUR,
                    phoneNumber: '+2222222222',
                    whatsappNumber: '+2222222222',
                },
            ],
            rsvpDueDate: new Date('2024-06-02'),
        };

        it('should update invitation successfully', async () => {
            const invitation = InvitationFixture.getLean({
                type: InvitationType.WEDDING,
                title: 'Wedding Celebration',
                hosts: [
                    {
                        name: 'John Doe',
                        title: 'Father of the Bride',
                        relationshipWithCelebratedPerson: RelationshipType.PARENT,
                        phoneNumber: '+0000000000',
                        email: 'john@example.com',
                    },
                ],
                celebratedPersons: [
                    {
                        name: 'Jane Doe',
                        title: 'Bride',
                        relationshipWithHost: RelationshipType.CHILD,
                        celebrationDate: new Date('2024-06-15'),
                        type: CelebratedPersonType.BRIDE,
                    },
                ],
                date: {
                    gregorianDate: new Date('2024-06-15'),
                    hijriDate: '1445-12-08',
                },
                location: {
                    address: '123 Wedding Hall, Downtown City',
                    wazeLink: 'https://waze.com/ul/0000000000',
                    googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
                },
                itineraries: [
                    {
                        activities: ['Reception', 'Dinner', 'Dancing'],
                        startTime: '18:00',
                        endTime: '23:00',
                    },
                ],
                contactPersons: [
                    {
                        name: 'Event Coordinator',
                        title: 'Wedding Coordinator',
                        relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                        phoneNumber: '+0000000000',
                        whatsappNumber: '+0000000000',
                    },
                ],
                rsvpDueDate: new Date('2024-06-01'),
            });
            await invitationModel.create(invitation);

            const result = await repository.updateById(
                invitation._id.toString(),
                updates,
            );

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: invitation._id,
                userId: invitation.userId,
                type: updates.type,
                title: updates.title,
                hosts: updates.hosts,
                celebratedPersons: updates.celebratedPersons,
                date: updates.date,
                location: updates.location,
                itineraries: updates.itineraries,
                contactPersons: updates.contactPersons,
                rsvpDueDate: updates.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: expect.any(Date),
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Invitation;

            expect(result).toBeInstanceOf(Invitation);
            expect(result).toEqual(toDomainResult);

            const updatedInvitation = await invitationModel.findOne({
                _id: invitation._id,
            }).lean<InvitationLean>();

            expect(updatedInvitation).toMatchObject({
                _id: invitation._id,
                userId: invitation.userId,
                type: updates.type,
                title: updates.title,
                hosts: updates.hosts,
                celebratedPersons: updates.celebratedPersons,
                date: updates.date,
                location: updates.location,
                itineraries: updates.itineraries,
                contactPersons: updates.contactPersons,
                rsvpDueDate: updates.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: expect.any(Date),
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            expect(updatedInvitation?.updatedAt.getTime()).toBeGreaterThan(invitation.updatedAt.getTime());
        });

        it('should return null when invitation does not exist', async () => {
            const result = await repository.updateById(
                '000000000000000000000001',
                updates,
            );

            expect(result).toBeNull();
        });

        it('should return null when invitation is deleted', async () => {
            const invitation = InvitationFixture.getLean({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.updateById(
                invitation._id.toString(),
                updates,
            );

            expect(result).toBeNull();
        });
    });

    describe('#updateByIdAndUserId', () => {
        const updates = {
            type: InvitationType.BIRTHDAY,
            title: 'Birthday Celebration',
            hosts: [
                {
                    name: 'Sushi',
                    title: 'Sushi',
                    relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                    phoneNumber: '+1111111111',
                    email: 'sushi@example.com',
                },
            ],
            celebratedPersons: [
                {
                    name: 'Syamel',
                    title: 'Syamel',
                    relationshipWithHost: RelationshipType.COLLEAGUE,
                    celebrationDate: new Date('2024-06-16'),
                    type: CelebratedPersonType.CHILD,
                },
            ],
            date: {
                gregorianDate: new Date('2024-06-16'),
                hijriDate: '1445-12-09',
            },
            location: {
                address: '123 Birthday Hall, Downtown City',
                wazeLink: 'https://waze.com/ul/1111111111',
                googleMapsLink: 'https://maps.google.com/?q=123+Birthday+Hall',
            },
            itineraries: [
                {
                    activities: ['Games', 'Quizzes', 'Food'],
                    startTime: '10:00',
                    endTime: '15:00',
                },
            ],
            contactPersons: [
                {
                    name: 'Birthday Coordinator',
                    title: 'Birthday Coordinator',
                    relationshipWithCelebratedPerson: RelationshipType.NEIGHBOUR,
                    phoneNumber: '+2222222222',
                    whatsappNumber: '+2222222222',
                },
            ],
            rsvpDueDate: new Date('2024-06-02'),
        };

        it('should update invitation successfully', async () => {
            const invitation = InvitationFixture.getLean({
                type: InvitationType.WEDDING,
                title: 'Wedding Celebration',
                hosts: [
                    {
                        name: 'John Doe',
                        title: 'Father of the Bride',
                        relationshipWithCelebratedPerson: RelationshipType.PARENT,
                        phoneNumber: '+0000000000',
                        email: 'john@example.com',
                    },
                ],
                celebratedPersons: [
                    {
                        name: 'Jane Doe',
                        title: 'Bride',
                        relationshipWithHost: RelationshipType.CHILD,
                        celebrationDate: new Date('2024-06-15'),
                        type: CelebratedPersonType.BRIDE,
                    },
                ],
                date: {
                    gregorianDate: new Date('2024-06-15'),
                    hijriDate: '1445-12-08',
                },
                location: {
                    address: '123 Wedding Hall, Downtown City',
                    wazeLink: 'https://waze.com/ul/0000000000',
                    googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
                },
                itineraries: [
                    {
                        activities: ['Reception', 'Dinner', 'Dancing'],
                        startTime: '18:00',
                        endTime: '23:00',
                    },
                ],
                contactPersons: [
                    {
                        name: 'Event Coordinator',
                        title: 'Wedding Coordinator',
                        relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                        phoneNumber: '+0000000000',
                        whatsappNumber: '+0000000000',
                    },
                ],
                rsvpDueDate: new Date('2024-06-01'),
            });
            await invitationModel.create(invitation);

            const result = await repository.updateByIdAndUserId(
                invitation._id.toString(),
                invitation.userId,
                updates,
            );

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: invitation._id,
                userId: invitation.userId,
                type: updates.type,
                title: updates.title,
                hosts: updates.hosts,
                celebratedPersons: updates.celebratedPersons,
                date: updates.date,
                location: updates.location,
                itineraries: updates.itineraries,
                contactPersons: updates.contactPersons,
                rsvpDueDate: updates.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: expect.any(Date),
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Invitation;

            expect(result).toBeInstanceOf(Invitation);
            expect(result).toEqual(toDomainResult);

            const updatedInvitation = await invitationModel.findOne({
                _id: invitation._id,
            }).lean<InvitationLean>();

            expect(updatedInvitation).toMatchObject({
                _id: invitation._id,
                userId: invitation.userId,
                type: updates.type,
                title: updates.title,
                hosts: updates.hosts,
                celebratedPersons: updates.celebratedPersons,
                date: updates.date,
                location: updates.location,
                itineraries: updates.itineraries,
                contactPersons: updates.contactPersons,
                rsvpDueDate: updates.rsvpDueDate,
                createdAt: invitation.createdAt,
                updatedAt: expect.any(Date),
                isDeleted: invitation.isDeleted,
                deletedAt: invitation.deletedAt,
            });

            expect(updatedInvitation?.updatedAt.getTime()).toBeGreaterThan(invitation.updatedAt.getTime());
        });

        it('should return null when invitation does not exist', async () => {
            const result = await repository.updateByIdAndUserId(
                '000000000000000000000001',
                '000000000000000000000002',
                updates,
            );

            expect(result).toBeNull();
        });

        it('should return null when invitation is deleted', async () => {
            const invitation = InvitationFixture.getLean({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.updateByIdAndUserId(
                invitation._id.toString(),
                invitation.userId,
                updates,
            );

            expect(result).toBeNull();
        });

        it('should return null when invitation does not belong to user', async () => {
            const invitation = InvitationFixture.getLean();
            await invitationModel.create(invitation);

            const result = await repository.updateByIdAndUserId(
                invitation._id.toString(),
                '000000000000000000000002',
                updates,
            );

            expect(result).toBeNull();
        });
    });

    describe('#deleteById', () => {
        it('should mark an invitation as deleted', async () => {
            const invitation = InvitationFixture.getLean();
            await invitationModel.create(invitation);

            const result = await repository.deleteById(
                invitation._id.toString(),
            );

            expect(result).toBe(true);

            const updatedInvitation = await invitationModel.findOne({
                _id: invitation._id,
            }).lean<InvitationLean>();

            expect(updatedInvitation?.isDeleted).toBe(true);
            expect(updatedInvitation?.deletedAt?.getTime()).toBeGreaterThan(invitation.deletedAt?.getTime() ?? 0);
            expect(updatedInvitation?.updatedAt.getTime()).toBeGreaterThan(invitation.updatedAt.getTime());
        });

        it('should return false when invitation does not exist', async () => {
            const result = await repository.deleteById(
                '000000000000000000000001',
            );

            expect(result).toBe(false);
        });

        it('should return false when invitation is already deleted', async () => {
            const invitation = InvitationFixture.getEntity({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.deleteById(
                invitation.id,
            );

            expect(result).toBe(false);
        });
    });

    describe('#deleteByIdAndUserId', () => {
        it('should return true when invitation is deleted', async () => {
            const invitation = InvitationFixture.getLean();
            await invitationModel.create(invitation);

            const result = await repository.deleteByIdAndUserId(
                invitation._id.toString(),
                invitation.userId,
            );

            expect(result).toBe(true);

            const updatedInvitation = await invitationModel.findOne({
                _id: invitation._id,
            }).lean<InvitationLean>();

            expect(updatedInvitation?.isDeleted).toBe(true);
            expect(updatedInvitation?.deletedAt?.getTime()).toBeGreaterThan(invitation.deletedAt?.getTime() ?? 0);
            expect(updatedInvitation?.updatedAt.getTime()).toBeGreaterThan(invitation.updatedAt.getTime());
        });

        it('should return false when invitation does not exist', async () => {
            const result = await repository.deleteByIdAndUserId(
                '000000000000000000000001',
                '000000000000000000000001',
            );

            expect(result).toBe(false);
        });

        it('should return false when invitation is already deleted', async () => {
            const invitation = InvitationFixture.getLean({
                isDeleted: true,
            });
            await invitationModel.create(invitation);

            const result = await repository.deleteByIdAndUserId(
                invitation._id.toString(),
                invitation.userId,
            );

            expect(result).toBe(false);
        });

        it('should return false when invitation does not belong to user', async () => {
            const invitation = InvitationFixture.getLean();
            await invitationModel.create(invitation);

            const result = await repository.deleteByIdAndUserId(
                invitation._id.toString(),
                '000000000000000000000002',
            );

            expect(result).toBe(false);

            const updatedInvitation = await invitationModel.findOne({
                _id: invitation._id,
            }).lean<InvitationLean>();

            expect(updatedInvitation?.isDeleted).toBe(false);
            expect(updatedInvitation?.deletedAt).toBeNull();
            expect(updatedInvitation?.updatedAt).toStrictEqual(invitation.updatedAt);
        });
    });
});
