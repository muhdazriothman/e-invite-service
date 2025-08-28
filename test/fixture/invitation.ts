import {
    InvitationType,
    CelebratedPersonType,
    RelationshipType,
    Invitation,
} from '@invitation/domain/entities/invitation';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import { plainToClass } from 'class-transformer';

export class InvitationFixture {
    static getInvitationProps(props: Partial<Invitation> = {}) {
        const {
            id = 'test-id-123',
            type = InvitationType.WEDDING,
            title = 'Wedding Celebration',
            hosts = [
                {
                    name: 'John Doe',
                    title: 'Father of the Bride',
                    relationshipWithCelebratedPerson: RelationshipType.PARENT,
                    phoneNumber: '+1234567890',
                    email: 'john@example.com',
                },
            ],
            celebratedPersons = [
                {
                    name: 'Jane Doe',
                    title: 'Bride',
                    relationshipWithHost: RelationshipType.CHILD,
                    celebrationDate: new Date('2024-06-15'),
                    type: CelebratedPersonType.BRIDE,
                },
            ],
            date = {
                gregorianDate: new Date('2024-06-15'),
                hijriDate: '1445-12-08',
            },
            location = {
                address: '123 Wedding Hall, Downtown City',
                wazeLink: 'https://waze.com/ul/123456',
                googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
            },
            itineraries = [
                {
                    activities: ['Reception', 'Dinner', 'Dancing'],
                    startTime: '18:00',
                    endTime: '23:00',
                },
            ],
            contactPersons = [
                {
                    name: 'Event Coordinator',
                    title: 'Wedding Coordinator',
                    relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                    phoneNumber: '+1234567892',
                    whatsappNumber: '+1234567893',
                },
            ],
            rsvpDueDate = new Date('2024-06-01'),
            isDeleted = false,
            createdAt = new Date('2024-01-01T00:00:00.000Z'),
            updatedAt = new Date('2024-01-01T00:00:00.000Z'),
            deletedAt = null,
        } = props;

        return {
            id,
            type,
            title,
            hosts,
            celebratedPersons,
            date,
            location,
            itineraries,
            contactPersons,
            rsvpDueDate,
            isDeleted,
            createdAt,
            updatedAt,
            deletedAt,
        };
    }

    static getInvitationEntity(params: Partial<Invitation> = {}) {
        const props = InvitationFixture.getInvitationProps(params);
        return new Invitation(props);
    }

    static getCreateInvitationProps(params: Partial<Omit<Invitation, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'deletedAt'>> = {}) {
        const {
            type = InvitationType.WEDDING,
            title = 'Wedding Celebration',
            hosts = [
                {
                    name: 'John Doe',
                    title: 'Father of the Bride',
                    relationshipWithCelebratedPerson: RelationshipType.PARENT,
                    phoneNumber: '+1234567890',
                    email: 'john@example.com',
                },
            ],
            celebratedPersons = [
                {
                    name: 'Jane Doe',
                    title: 'Bride',
                    relationshipWithHost: RelationshipType.CHILD,
                    celebrationDate: new Date('2024-06-15'),
                    type: CelebratedPersonType.BRIDE,
                },
            ],
            date = {
                gregorianDate: new Date('2024-06-15'),
                hijriDate: '1445-12-08',
            },
            location = {
                address: '123 Wedding Hall, Downtown City',
                wazeLink: 'https://waze.com/ul/123456',
                googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
            },
            itineraries = [
                {
                    activities: ['Reception', 'Dinner', 'Dancing'],
                    startTime: '18:00',
                    endTime: '23:00',
                },
            ],
            contactPersons = [
                {
                    name: 'Event Coordinator',
                    title: 'Wedding Coordinator',
                    relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                    phoneNumber: '+1234567892',
                    whatsappNumber: '+1234567893',
                },
            ],
            rsvpDueDate = new Date('2024-06-01'),
        } = params;

        return {
            type,
            title,
            hosts,
            celebratedPersons,
            date,
            location,
            itineraries,
            contactPersons,
            rsvpDueDate,
        };
    }

    static getCreateInvitationDto(params: Partial<CreateInvitationDto> = {}) {
        const {
            type = InvitationType.WEDDING,
            title = 'Wedding Celebration',
            hosts = [
                {
                    name: 'John Doe',
                    title: 'Father of the Bride',
                    relationshipWithCelebratedPerson: RelationshipType.PARENT,
                    phoneNumber: '+1234567890',
                    email: 'john@example.com',
                },
            ],
            celebratedPersons = [
                {
                    name: 'Jane Doe',
                    title: 'Bride',
                    relationshipWithHost: RelationshipType.CHILD,
                    celebrationDate: '2024-06-15T00:00:00.000Z',
                    type: CelebratedPersonType.BRIDE,
                },
            ],
            date = {
                gregorianDate: '2024-06-15T00:00:00.000Z',
                hijriDate: '1445-12-08',
            },
            location = {
                address: '123 Wedding Hall, Downtown City',
                wazeLink: 'https://waze.com/ul/123456',
                googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
            },
            itineraries = [
                {
                    activities: ['Reception', 'Dinner', 'Dancing'],
                    startTime: '18:00',
                    endTime: '23:00',
                },
            ],
            contactPersons = [
                {
                    name: 'Event Coordinator',
                    title: 'Wedding Coordinator',
                    relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                    phoneNumber: '+1234567892',
                    whatsappNumber: '+1234567893',
                },
            ],
            rsvpDueDate = '2024-06-01T00:00:00.000Z',
        } = params;

        const plainData = {
            type,
            title,
            hosts,
            celebratedPersons,
            date,
            location,
            itineraries,
            contactPersons,
            rsvpDueDate,
        };

        return plainToClass(CreateInvitationDto, plainData);
    }
}
