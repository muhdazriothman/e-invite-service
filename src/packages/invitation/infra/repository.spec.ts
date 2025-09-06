import {
  CelebratedPersonType,
  Invitation,
  InvitationType,
  RelationshipType,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
  InvitationMongoDocument,
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
  let invitationRepository: InvitationRepository;
  let invitationModel: Model<InvitationMongoDocument>;
  let module: TestingModule;

  beforeAll(async() => {
    const testContext = await setupRepositoryTest(
      [{ name: InvitationMongoModelName, schema: InvitationMongoSchema }],
      [InvitationRepository],
    );

    module = testContext.module;
    invitationRepository =
      module.get<InvitationRepository>(InvitationRepository);
    invitationModel = module.get<Model<InvitationMongoDocument>>(
      getModelToken(InvitationMongoModelName),
    );
  });

  afterAll(async() => {
    await module.close();
    await MongoTestSetup.stop();
  });

  beforeEach(async() => {
    await invitationModel.deleteMany({});
  });

  describe('#toDomain', () => {
    it('should convert MongoDB document to domain entity correctly', () => {
      const mockDocument = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        userId: '000000000000000000000001',
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
        hosts: [
          {
            name: 'John Doe',
            title: 'Father of the Bride',
            relationshipWithCelebratedPerson: RelationshipType.PARENT,
            phoneNumber: '+1234567890',
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
          wazeLink: 'https://waze.com/ul/123456',
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
            phoneNumber: '+1234567892',
            whatsappNumber: '+1234567893',
          },
        ],
        rsvpDueDate: new Date('2024-06-01'),
        isDeleted: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
      };

      const result = InvitationRepository.toDomain(mockDocument);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.userId).toBe('000000000000000000000001');
      expect(result.type).toBe(InvitationType.WEDDING);
      expect(result.title).toBe('Wedding Celebration');
      expect(result.hosts).toEqual(mockDocument.hosts);
      expect(result.celebratedPersons).toEqual(mockDocument.celebratedPersons);
      expect(result.date).toEqual(mockDocument.date);
      expect(result.location).toEqual(mockDocument.location);
      expect(result.itineraries).toEqual(mockDocument.itineraries);
      expect(result.contactPersons).toEqual(mockDocument.contactPersons);
      expect(result.rsvpDueDate).toEqual(mockDocument.rsvpDueDate);
      expect(result.isDeleted).toBe(false);
      expect(result.createdAt).toEqual(mockDocument.createdAt);
      expect(result.updatedAt).toEqual(mockDocument.updatedAt);
      expect(result.deletedAt).toBeNull();
    });

    it('should handle document with null deletedAt', () => {
      const mockDocument = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        userId: '000000000000000000000001',
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
        hosts: [],
        celebratedPersons: [],
        date: {
          gregorianDate: new Date('2024-06-15'),
          hijriDate: '1445-12-08',
        },
        location: {
          address: '123 Wedding Hall',
          wazeLink: null,
          googleMapsLink: null,
        },
        itineraries: [],
        contactPersons: [],
        rsvpDueDate: new Date('2024-06-01'),
        isDeleted: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
      };

      const result = InvitationRepository.toDomain(mockDocument);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.deletedAt).toBeNull();
    });

    it('should handle document with undefined isDeleted', () => {
      const mockDocument = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        userId: '000000000000000000000001',
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
        hosts: [],
        celebratedPersons: [],
        date: {
          gregorianDate: new Date('2024-06-15'),
          hijriDate: '1445-12-08',
        },
        location: {
          address: '123 Wedding Hall',
          wazeLink: null,
          googleMapsLink: null,
        },
        itineraries: [],
        contactPersons: [],
        rsvpDueDate: new Date('2024-06-01'),
        isDeleted: undefined,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: undefined,
      };

      const result = InvitationRepository.toDomain(mockDocument);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.isDeleted).toBe(false);
      expect(result.deletedAt).toBeNull();
    });

    it('should handle document with deleted invitation', () => {
      const mockDocument = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        userId: '000000000000000000000001',
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
        hosts: [],
        celebratedPersons: [],
        date: {
          gregorianDate: new Date('2024-06-15'),
          hijriDate: '1445-12-08',
        },
        location: {
          address: '123 Wedding Hall',
          wazeLink: null,
          googleMapsLink: null,
        },
        itineraries: [],
        contactPersons: [],
        rsvpDueDate: new Date('2024-06-01'),
        isDeleted: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: new Date('2024-01-02T00:00:00.000Z'),
      };

      const result = InvitationRepository.toDomain(mockDocument);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toEqual(new Date('2024-01-02T00:00:00.000Z'));
    });

    it('should handle document with string _id', () => {
      const mockDocument = {
        _id: '507f1f77bcf86cd799439011',
        userId: '000000000000000000000001',
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
        hosts: [],
        celebratedPersons: [],
        date: {
          gregorianDate: new Date('2024-06-15'),
          hijriDate: '1445-12-08',
        },
        location: {
          address: '123 Wedding Hall',
          wazeLink: null,
          googleMapsLink: null,
        },
        itineraries: [],
        contactPersons: [],
        rsvpDueDate: new Date('2024-06-01'),
        isDeleted: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
      };

      const result = InvitationRepository.toDomain(mockDocument);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle document with null _id', () => {
      const mockDocument = {
        _id: null,
        userId: '000000000000000000000001',
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
        hosts: [],
        celebratedPersons: [],
        date: {
          gregorianDate: new Date('2024-06-15'),
          hijriDate: '1445-12-08',
        },
        location: {
          address: '123 Wedding Hall',
          wazeLink: null,
          googleMapsLink: null,
        },
        itineraries: [],
        contactPersons: [],
        rsvpDueDate: new Date('2024-06-01'),
        isDeleted: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        deletedAt: null,
      };

      const result = InvitationRepository.toDomain(mockDocument);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.id).toBe('');
    });
  });

  describe('#create', () => {
    it('should create a new invitation successfully', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const result = await invitationRepository.create(createInvitationData);

      expect(result).toBeInstanceOf(Invitation);
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Wedding Celebration');
      expect(result.type).toBe(InvitationType.WEDDING);
      expect(result.isDeleted).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.deletedAt).toBeNull();

      // Verify the invitation was actually saved to the database
      const savedInvitation = await invitationModel
        .findOne({ title: 'Wedding Celebration' })
        .lean();
      expect(savedInvitation).toBeDefined();
      expect(savedInvitation?.title).toBe('Wedding Celebration');
      expect(savedInvitation?.type).toBe(InvitationType.WEDDING);
    });

    it('should create multiple invitations with different data', async() => {
      const createInvitationData1 = InvitationFixture.getEntity({
        title: 'Wedding Celebration 1',
        type: InvitationType.WEDDING,
      });

      const createInvitationData2 = InvitationFixture.getEntity({
        title: 'Birthday Party',
        type: InvitationType.BIRTHDAY,
      });

      const result1 = await invitationRepository.create(createInvitationData1);
      const result2 = await invitationRepository.create(createInvitationData2);

      expect(result1).toBeInstanceOf(Invitation);
      expect(result2).toBeInstanceOf(Invitation);
      expect(result1.id).not.toBe(result2.id);
      expect(result1.title).toBe('Wedding Celebration 1');
      expect(result2.title).toBe('Birthday Party');

      // Verify both invitations were saved
      const savedInvitations = await invitationModel.find({}).lean();
      expect(savedInvitations).toHaveLength(2);
    });
  });

  describe('#findAll', () => {
    it('should return all non-deleted invitations', async() => {
      // Create test invitations
      const createInvitationData1 = InvitationFixture.getEntity({
        title: 'Wedding Celebration 1',
        type: InvitationType.WEDDING,
      });

      const createInvitationData2 = InvitationFixture.getEntity({
        title: 'Birthday Party',
        type: InvitationType.BIRTHDAY,
      });

      await invitationRepository.create(createInvitationData1);
      await invitationRepository.create(createInvitationData2);

      const result = await invitationRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Invitation);
      expect(result[1]).toBeInstanceOf(Invitation);
      expect(result[0].title).toBe('Wedding Celebration 1');
      expect(result[1].title).toBe('Birthday Party');
    });

    it('should return empty array when no invitations exist', async() => {
      const result = await invitationRepository.findAll();

      expect(result).toEqual([]);
    });

    it('should exclude deleted invitations from results', async() => {
      // Create an invitation
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);

      // Delete the invitation
      await invitationRepository.delete(invitation.id);

      const result = await invitationRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('#findAllWithPagination', () => {
    it('should return paginated invitations with default limit (forward)', async() => {
      // Create multiple invitations
      const invitations: Invitation[] = [];
      for (let i = 0; i < 25; i++) {
        const invitation = InvitationFixture.getEntity({
          title: `Wedding Celebration ${i + 1}`,
          type: InvitationType.WEDDING,
        });
        invitations.push(await invitationRepository.create(invitation));
      }

      const result = await invitationRepository.findAllWithPagination();

      expect(result.data).toHaveLength(20); // default limit
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false); // First page
      expect(result.count).toBe(20);
      expect(result.nextCursor).toBeDefined();
      expect(result.previousCursor).toBeUndefined(); // First page has no previous cursor
      expect(result.data[0]).toBeInstanceOf(Invitation);
    });

    it('should return paginated invitations with custom limit (forward)', async() => {
      // Create multiple invitations
      const invitations: Invitation[] = [];
      for (let i = 0; i < 15; i++) {
        const invitation = InvitationFixture.getEntity({
          title: `Wedding Celebration ${i + 1}`,
          type: InvitationType.WEDDING,
        });
        invitations.push(await invitationRepository.create(invitation));
      }

      const result = await invitationRepository.findAllWithPagination(
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

    it('should return paginated invitations with next cursor (forward pagination)', async() => {
      // Create multiple invitations
      const invitations: Invitation[] = [];
      for (let i = 0; i < 15; i++) {
        const invitation = InvitationFixture.getEntity({
          title: `Wedding Celebration ${i + 1}`,
          type: InvitationType.WEDDING,
        });
        invitations.push(await invitationRepository.create(invitation));
      }

      // Get first page
      const firstPage = await invitationRepository.findAllWithPagination(
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
      const secondPage = await invitationRepository.findAllWithPagination(
        undefined,
        firstPage.nextCursor,
        undefined,
        5,
      );
      expect(secondPage.data).toHaveLength(5);
      expect(secondPage.data[0].id).not.toBe(firstPage.data[0].id);
      expect(secondPage.hasPreviousPage).toBe(true);
    });

    it('should return paginated invitations with previous cursor (backward pagination)', async() => {
      // Create multiple invitations
      const invitations: Invitation[] = [];
      for (let i = 0; i < 15; i++) {
        const invitation = InvitationFixture.getEntity({
          title: `Wedding Celebration ${i + 1}`,
          type: InvitationType.WEDDING,
        });
        invitations.push(await invitationRepository.create(invitation));
      }

      // Get first page
      const firstPage = await invitationRepository.findAllWithPagination(
        undefined,
        undefined,
        undefined,
        5,
      );

      // Get second page using next cursor
      const secondPage = await invitationRepository.findAllWithPagination(
        undefined,
        firstPage.nextCursor,
        undefined,
        5,
      );

      // Go back to first page using previous cursor
      const backToFirstPage = await invitationRepository.findAllWithPagination(
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

    it('should return empty pagination result when no invitations exist', async() => {
      const result = await invitationRepository.findAllWithPagination();

      expect(result.data).toEqual([]);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
      expect(result.count).toBe(0);
      expect(result.nextCursor).toBeUndefined();
      expect(result.previousCursor).toBeUndefined();
    });

    it('should filter by userId when provided', async() => {
      const user1Invitation = InvitationFixture.getEntity({
        userId: 'user1',
        title: 'User 1 Wedding',
      });
      const user2Invitation = InvitationFixture.getEntity({
        userId: 'user2',
        title: 'User 2 Wedding',
      });

      await invitationRepository.create(user1Invitation);
      await invitationRepository.create(user2Invitation);

      const result = await invitationRepository.findAllWithPagination('user1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe('user1');
      expect(result.data[0].title).toBe('User 1 Wedding');
    });

    it('should handle invalid next cursor gracefully', async() => {
      // Create an invitation
      const invitation = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
      });
      await invitationRepository.create(invitation);

      const result = await invitationRepository.findAllWithPagination(
        undefined,
        'invalid-cursor',
      );

      expect(result.data).toHaveLength(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('should handle invalid previous cursor gracefully', async() => {
      // Create an invitation
      const invitation = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
      });
      await invitationRepository.create(invitation);

      const result = await invitationRepository.findAllWithPagination(
        undefined,
        undefined,
        'invalid-cursor',
      );

      expect(result.data).toHaveLength(1);
      expect(result.hasPreviousPage).toBe(false);
    });
  });

  describe('#findById', () => {
    it('should return an invitation when found by id', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const createdInvitation =
        await invitationRepository.create(createInvitationData);

      const result = await invitationRepository.findById(createdInvitation.id);

      expect(result).toBeInstanceOf(Invitation);
      expect(result?.id).toBe(createdInvitation.id);
      expect(result?.title).toBe('Wedding Celebration');
      expect(result?.type).toBe(InvitationType.WEDDING);
      expect(result?.isDeleted).toBe(false);
    });

    it('should return null when invitation is not found', async() => {
      const result = await invitationRepository.findById(
        new Types.ObjectId().toString(),
      );

      expect(result).toBeNull();
    });

    it('should exclude deleted invitations from search', async() => {
      // Create an invitation
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);

      // Delete the invitation
      await invitationRepository.delete(invitation.id);

      const result = await invitationRepository.findById(invitation.id);

      expect(result).toBeNull();
    });
  });

  describe('#update', () => {
    it('should update invitation title successfully', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);
      const originalUpdatedAt = invitation.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const newTitle = 'Updated Wedding Celebration';
      const result = await invitationRepository.update(invitation.id, {
        title: newTitle,
      });

      expect(result).toBeInstanceOf(Invitation);
      expect(result?.id).toBe(invitation.id);
      expect(result?.title).toBe(newTitle);
      expect(result?.type).toBe(InvitationType.WEDDING);
      expect(result?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      // Verify the update was persisted
      const updatedInvitation = await invitationRepository.findById(
        invitation.id,
      );
      expect(updatedInvitation?.title).toBe(newTitle);
    });

    it('should return null when invitation does not exist', async() => {
      const result = await invitationRepository.update(
        new Types.ObjectId().toString(),
        { title: 'Updated Title' },
      );

      expect(result).toBeNull();
    });

    it('should return null when invitation is deleted', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);

      // Delete the invitation
      await invitationRepository.delete(invitation.id);

      // Try to update deleted invitation
      const result = await invitationRepository.update(invitation.id, {
        title: 'Updated Title',
      });

      expect(result).toBeNull();
    });

    it('should update only specified fields', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);
      const originalType = invitation.type;

      const newTitle = 'Updated Wedding Celebration';
      const result = await invitationRepository.update(invitation.id, {
        title: newTitle,
      });

      expect(result).toBeInstanceOf(Invitation);
      expect(result?.title).toBe(newTitle);
      expect(result?.type).toBe(originalType);
    });

    it('should update type successfully', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);
      const originalUpdatedAt = invitation.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const newType = InvitationType.BIRTHDAY;
      const result = await invitationRepository.update(invitation.id, {
        type: newType,
      });

      expect(result).toBeInstanceOf(Invitation);
      expect(result?.id).toBe(invitation.id);
      expect(result?.title).toBe('Wedding Celebration');
      expect(result?.type).toBe(newType);
      expect(result?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      // Verify the update was persisted
      const updatedInvitation = await invitationRepository.findById(
        invitation.id,
      );
      expect(updatedInvitation?.type).toBe(newType);
    });

    it('should update title and type successfully', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);
      const originalUpdatedAt = invitation.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const newTitle = 'Updated Wedding Celebration';
      const newType = InvitationType.BIRTHDAY;
      const result = await invitationRepository.update(invitation.id, {
        title: newTitle,
        type: newType,
      });

      expect(result).toBeInstanceOf(Invitation);
      expect(result?.id).toBe(invitation.id);
      expect(result?.title).toBe(newTitle);
      expect(result?.type).toBe(newType);
      expect(result?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      // Verify the update was persisted
      const updatedInvitation = await invitationRepository.findById(
        invitation.id,
      );
      expect(updatedInvitation?.title).toBe(newTitle);
      expect(updatedInvitation?.type).toBe(newType);
    });
  });

  describe('#delete', () => {
    it('should mark an invitation as deleted', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);

      const result = await invitationRepository.delete(invitation.id);

      expect(result).toBe(true);

      // Verify the invitation is marked as deleted
      const deletedInvitation = await invitationRepository.findById(
        invitation.id,
      );
      expect(deletedInvitation).toBeNull();
    });

    it('should return false when invitation does not exist', async() => {
      const result = await invitationRepository.delete(
        new Types.ObjectId().toString(),
      );

      expect(result).toBe(false);
    });

    it('should return false when invitation is already deleted', async() => {
      const createInvitationData = InvitationFixture.getEntity({
        title: 'Wedding Celebration',
        type: InvitationType.WEDDING,
      });

      const invitation =
        await invitationRepository.create(createInvitationData);

      // Delete the invitation first time
      await invitationRepository.delete(invitation.id);

      // Try to delete again
      const result = await invitationRepository.delete(invitation.id);

      expect(result).toBe(false);
    });
  });
});
