import { InvitationMapper } from './mapper';
import { InvitationFixture } from '@test/fixture/invitation';
import { RelationshipType, CelebratedPersonType } from '@invitation/domain/entities/invitation';

describe('@invitation/interfaces/http/mapper', () => {

    describe('toDto', () => {
        it('should convert Invitation domain object to InvitationDto', () => {
            const mockInvitation = InvitationFixture.getEntity();
            const result = InvitationMapper.toDto(mockInvitation);

            expect(result.id).toBe(mockInvitation.id);
            expect(result.type).toBe(mockInvitation.type);
            expect(result.title).toBe(mockInvitation.title);
            expect(result.hosts).toEqual(mockInvitation.hosts);
            expect(result.celebratedPersons).toEqual([
                {
                    name: 'Jane Doe',
                    title: 'Bride',
                    relationshipWithHost: RelationshipType.CHILD,
                    celebrationDate: '2024-06-15T00:00:00.000Z',
                    type: CelebratedPersonType.BRIDE,
                },
            ]);
            expect(result.date).toEqual({
                gregorianDate: '2024-06-15T00:00:00.000Z',
                hijriDate: '1445-12-08',
            });
            expect(result.location).toEqual(mockInvitation.location);
            expect(result.itineraries).toEqual([
                {
                    activities: ['Reception', 'Dinner', 'Dancing'],
                    startTime: '18:00',
                    endTime: '23:00',
                },
            ]);
            expect(result.contactPersons).toEqual(mockInvitation.contactPersons);
            expect(result.rsvpDueDate).toBe('2024-06-01T00:00:00.000Z');
            expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
            expect(result.updatedAt).toBe('2024-01-01T00:00:00.000Z');
        });

        it('should convert Date objects to ISO strings', () => {
            const mockInvitation = InvitationFixture.getEntity();
            const result = InvitationMapper.toDto(mockInvitation);

            expect(result.celebratedPersons[0].celebrationDate).toBe('2024-06-15T00:00:00.000Z');
            expect(result.date.gregorianDate).toBe('2024-06-15T00:00:00.000Z');
            expect(result.itineraries[0].startTime).toBe('18:00');
            expect(result.itineraries[0].endTime).toBe('23:00');
            expect(result.rsvpDueDate).toBe('2024-06-01T00:00:00.000Z');
        });

        it('should preserve optional fields', () => {
            const invitationWithOptionals = InvitationFixture.getEntity({
                hosts: [
                    {
                        name: 'John Doe',
                        title: 'Father of the Bride',
                        relationshipWithCelebratedPerson: RelationshipType.PARENT,
                        phoneNumber: null,
                        email: null,
                    },
                ],
                date: {
                    gregorianDate: new Date('2024-06-15T00:00:00.000Z'),
                    hijriDate: null,
                },
                location: {
                    address: '123 Wedding Hall, City',
                    wazeLink: null,
                    googleMapsLink: null,
                },
                contactPersons: [
                    {
                        name: 'Mary Smith',
                        title: 'Event Coordinator',
                        relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                        phoneNumber: null,
                        whatsappNumber: null,
                    },
                ],
            });

            const result = InvitationMapper.toDto(invitationWithOptionals);

            expect(result.hosts[0].phoneNumber).toBeNull();
            expect(result.hosts[0].email).toBeNull();
            expect(result.date.hijriDate).toBeNull();
            expect(result.location.wazeLink).toBeNull();
            expect(result.location.googleMapsLink).toBeNull();
            expect(result.contactPersons[0].phoneNumber).toBeNull();
            expect(result.contactPersons[0].whatsappNumber).toBeNull();
        });
    });
});
