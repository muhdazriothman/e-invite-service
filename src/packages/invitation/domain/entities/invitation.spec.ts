import {
    Invitation,
    InvitationType,
} from '@invitation/domain/entities/invitation';
import { InvitationFixture } from '@test/fixture/invitation';
import { ObjectId } from 'mongodb';

describe('@invitation/domain/entities/invitation', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('createNew', () => {
        it('should create a new invitation with correct properties', () => {
            const createProps = InvitationFixture.getInvitationProps();
            const invitation = Invitation.createNew(createProps);

            expect(invitation).toBeInstanceOf(Invitation);
            expect(invitation).toEqual({
                id: '',
                userId: createProps.userId,
                type: createProps.type,
                title: createProps.title,
                hosts: createProps.hosts,
                celebratedPersons: [
                    {
                        name: createProps.celebratedPersons[0].name,
                        title: createProps.celebratedPersons[0].title,
                        relationshipWithHost: createProps.celebratedPersons[0].relationshipWithHost,
                        celebrationDate: new Date(createProps.celebratedPersons[0].celebrationDate),
                        type: createProps.celebratedPersons[0].type,
                    },
                ],
                date: {
                    gregorianDate: new Date(createProps.date.gregorianDate),
                    hijriDate: createProps.date.hijriDate,
                },
                location: createProps.location,
                itineraries: createProps.itineraries,
                contactPersons: createProps.contactPersons,
                rsvpDueDate: new Date(createProps.rsvpDueDate),
                isDeleted: false,
                deletedAt: null,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            });
        });
    });

    describe('createFromDb', () => {
        it('should create an invitation from database props', () => {
            const createProps = InvitationFixture.getCreateInvitationProps();
            const dbProps = {
                _id: new ObjectId('000000000000000000000001'),
                userId: createProps.userId,
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

            expect(invitation).toBeInstanceOf(Invitation);
            expect(invitation).toEqual({
                id: dbProps._id.toString(),
                userId: dbProps.userId,
                type: dbProps.type,
                title: dbProps.title,
                hosts: dbProps.hosts,
                celebratedPersons: dbProps.celebratedPersons,
                date: dbProps.date,
                location: dbProps.location,
                itineraries: dbProps.itineraries,
                contactPersons: dbProps.contactPersons,
                rsvpDueDate: dbProps.rsvpDueDate,
                isDeleted: dbProps.isDeleted,
                createdAt: dbProps.createdAt,
                updatedAt: dbProps.updatedAt,
                deletedAt: dbProps.deletedAt,
            });
        });
    });

    describe('constructor', () => {
        it('should create an invitation with all provided properties', () => {
            const createProps = InvitationFixture.getCreateInvitationProps();
            const props = {
                id: '000000000000000000000001',
                userId: createProps.userId,
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

            expect(invitation).toBeInstanceOf(Invitation);
            expect(invitation).toEqual({
                id: props.id,
                userId: props.userId,
                type: props.type,
                title: props.title,
                hosts: props.hosts,
                celebratedPersons: props.celebratedPersons,
                date: props.date,
                location: props.location,
                itineraries: props.itineraries,
                contactPersons: props.contactPersons,
                rsvpDueDate: props.rsvpDueDate,
                isDeleted: props.isDeleted,
                createdAt: props.createdAt,
                updatedAt: props.updatedAt,
                deletedAt: props.deletedAt,
            });
        });
    });
});
