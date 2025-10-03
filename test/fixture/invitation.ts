import {
    CelebratedPersonType,
    Invitation,
    InvitationProps,
    InvitationType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { InvitationLean } from '@invitation/infra/schema';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';

import { UpdateInvitationDto } from '../../src/packages/invitation/interfaces/http/dtos/update';

export class InvitationFixture {
    static getProps (
        props: Partial<Invitation> = {},
    ): InvitationProps {
        const {
            id = '000000000000000000000001',
            userId = '000000000000000000000001',
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
            createdAt = new Date('2024-01-01'),
            updatedAt = new Date('2024-01-01'),
            deletedAt = null,
        } = props;

        return {
            id,
            userId,
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

    static getEntity (
        params: Partial<Invitation> = {},
    ): Invitation {
        const props = InvitationFixture.getProps(params);
        return new Invitation(props);
    }

    static getLean (
        params: Partial<Invitation> = {},
    ): InvitationLean {
        const props = InvitationFixture.getProps(params);

        return {
            _id: new Types.ObjectId(props.id),
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
        };
    }

    static getCreateDto (
        params: Partial<CreateInvitationDto> = {},
    ): CreateInvitationDto {
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

    static getUpdateDto (
        params: Partial<UpdateInvitationDto> = {},
    ): UpdateInvitationDto {
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

        return plainToClass(UpdateInvitationDto, plainData);
    }
}
