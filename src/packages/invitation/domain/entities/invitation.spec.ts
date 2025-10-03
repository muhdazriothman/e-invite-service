import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationFixture } from '@test/fixture/invitation';

describe('@invitation/domain/entities/invitation', () => {
    let props: ReturnType<typeof InvitationFixture.getProps>;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

        props = InvitationFixture.getProps();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('should create an invitation with all provided properties', () => {
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
                createdAt: props.createdAt,
                updatedAt: props.updatedAt,
                isDeleted: props.isDeleted,
                deletedAt: props.deletedAt,
            });
        });
    });

    describe('createNew', () => {
        it('should create a new invitation with correct properties', () => {
            const invitation = Invitation.createNew(props);

            expect(invitation).toBeInstanceOf(Invitation);
            expect(invitation).toMatchObject({
                id: '',
                userId: props.userId,
                type: props.type,
                title: props.title,
                hosts: props.hosts,
                celebratedPersons: [
                    {
                        name: props.celebratedPersons[0].name,
                        title: props.celebratedPersons[0].title,
                        relationshipWithHost: props.celebratedPersons[0].relationshipWithHost,
                        celebrationDate: new Date(props.celebratedPersons[0].celebrationDate),
                        type: props.celebratedPersons[0].type,
                    },
                ],
                date: {
                    gregorianDate: new Date(props.date.gregorianDate),
                    hijriDate: props.date.hijriDate,
                },
                location: props.location,
                itineraries: props.itineraries,
                contactPersons: props.contactPersons,
                rsvpDueDate: new Date(props.rsvpDueDate),
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-01-01T00:00:00.000Z'),
                isDeleted: false,
                deletedAt: null,
            });
        });
    });

    describe('createFromDb', () => {
        it('should create an invitation from database props', () => {
            const dbProps = InvitationFixture.getLean();

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
});
