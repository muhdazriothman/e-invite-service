import { InvitationFixture } from '@test/fixture/invitation';

import {
  Invitation,
  InvitationType,
} from './invitation';

describe('@invitation/domain/entities/invitation', () => {
  describe('createNew', () => {
    it('should create a new invitation with correct properties', () => {
      const createProps = InvitationFixture.getCreateInvitationDto();
      const userId = '000000000000000000000001';
      const invitation = Invitation.createNew(createProps, userId);

      expect(invitation.id).toBe('');
      expect(invitation.userId).toBe(userId);
      expect(invitation.type).toBe(createProps.type);
      expect(invitation.title).toBe(createProps.title);
      expect(invitation.hosts).toEqual(createProps.hosts);
      expect(invitation.celebratedPersons).toEqual(
        createProps.celebratedPersons.map((person) => ({
          ...person,
          celebrationDate: expect.any(Date),
        })),
      );
      expect(invitation.date).toEqual({
        gregorianDate: expect.any(Date),
        hijriDate: createProps.date.hijriDate,
      });
      expect(invitation.location).toEqual(createProps.location);
      expect(invitation.itineraries).toEqual(createProps.itineraries);
      expect(invitation.contactPersons).toEqual(createProps.contactPersons);
      expect(invitation.rsvpDueDate).toEqual(expect.any(Date));
      expect(invitation.isDeleted).toBe(false);
      expect(invitation.deletedAt).toBeNull();
      expect(invitation.createdAt).toBeInstanceOf(Date);
      expect(invitation.updatedAt).toBeInstanceOf(Date);
    });

    it('should set current timestamp for createdAt and updatedAt', () => {
      const beforeCreation = new Date();
      const createProps = InvitationFixture.getCreateInvitationDto();
      const userId = '000000000000000000000001';
      const invitation = Invitation.createNew(createProps, userId);
      const afterCreation = new Date();

      expect(invitation.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(invitation.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(invitation.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(invitation.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });
  });

  describe('createFromDb', () => {
    it('should create an invitation from database props', () => {
      const createProps = InvitationFixture.getCreateInvitationProps();
      const dbProps = {
        id: 'test-id-123',
        userId: '000000000000000000000001',
        type: InvitationType.BIRTHDAY,
        title: 'Birthday Party',
        hosts: createProps.hosts,
        celebratedPersons: createProps.celebratedPersons,
        date: createProps.date,
        location: createProps.location,
        itineraries: createProps.itineraries,
        contactPersons: createProps.contactPersons,
        rsvpDueDate: createProps.rsvpDueDate,
        isDeleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      const invitation = Invitation.createFromDb(dbProps);

      expect(invitation.id).toBe(dbProps.id);
      expect(invitation.userId).toBe(dbProps.userId);
      expect(invitation.type).toBe(dbProps.type);
      expect(invitation.title).toBe(dbProps.title);
      expect(invitation.isDeleted).toBe(dbProps.isDeleted);
      expect(invitation.createdAt).toEqual(dbProps.createdAt);
      expect(invitation.updatedAt).toEqual(dbProps.updatedAt);
      expect(invitation.deletedAt).toBe(dbProps.deletedAt);
    });
  });

  describe('constructor', () => {
    it('should create an invitation with all provided properties', () => {
      const createProps = InvitationFixture.getCreateInvitationProps();
      const props = {
        id: 'test-id',
        userId: '000000000000000000000001',
        type: InvitationType.CORPORATE,
        title: 'Corporate Event',
        hosts: createProps.hosts,
        celebratedPersons: createProps.celebratedPersons,
        date: createProps.date,
        location: createProps.location,
        itineraries: createProps.itineraries,
        contactPersons: createProps.contactPersons,
        rsvpDueDate: createProps.rsvpDueDate,
        isDeleted: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: new Date('2024-01-03'),
      };

      const invitation = new Invitation(props);

      expect(invitation.id).toBe(props.id);
      expect(invitation.userId).toBe(props.userId);
      expect(invitation.type).toBe(props.type);
      expect(invitation.title).toBe(props.title);
      expect(invitation.isDeleted).toBe(props.isDeleted);
      expect(invitation.createdAt).toEqual(props.createdAt);
      expect(invitation.updatedAt).toEqual(props.updatedAt);
      expect(invitation.deletedAt).toEqual(props.deletedAt);
    });
  });
});
