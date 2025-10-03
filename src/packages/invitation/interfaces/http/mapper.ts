import { Invitation } from '@invitation/domain/entities/invitation';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@shared/dtos/pagination-result';

export class InvitationDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    title: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                relationshipWithCelebratedPerson: { type: 'string' },
                phoneNumber: {
                    type: 'string',
                    nullable: true,
                },
                email: {
                    type: 'string',
                    nullable: true,
                },
            },
        },
    })
    hosts: Array<{
        name: string;
        title: string;
        relationshipWithCelebratedPerson: string;
        phoneNumber?: string | null;
        email?: string | null;
    }>;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                relationshipWithHost: { type: 'string' },
                celebrationDate: { type: 'string' },
                type: { type: 'string' },
            },
        },
    })
    celebratedPersons: Array<{
        name: string;
        title: string;
        relationshipWithHost: string;
        celebrationDate: string;
        type: string;
    }>;

    @ApiProperty({
        type: 'object',
        properties: {
            gregorianDate: { type: 'string' },
            hijriDate: {
                type: 'string',
                nullable: true,
            },
        },
    })
    date: {
        gregorianDate: string;
        hijriDate?: string | null;
    };

    @ApiProperty({
        type: 'object',
        properties: {
            address: { type: 'string' },
            wazeLink: {
                type: 'string',
                nullable: true,
            },
            googleMapsLink: {
                type: 'string',
                nullable: true,
            },
        },
    })
    location: {
        address: string;
        wazeLink?: string | null;
        googleMapsLink?: string | null;
    };

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                activities: {
                    type: 'array',
                    items: { type: 'string' },
                },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
            },
        },
    })
    itineraries: Array<{
        activities: string[];
        startTime: string;
        endTime: string;
    }>;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                relationshipWithCelebratedPerson: { type: 'string' },
                phoneNumber: {
                    type: 'string',
                    nullable: true,
                },
                whatsappNumber: {
                    type: 'string',
                    nullable: true,
                },
            },
        },
    })
    contactPersons: Array<{
        name: string;
        title: string;
        relationshipWithCelebratedPerson: string;
        phoneNumber?: string | null;
        whatsappNumber?: string | null;
    }>;

    @ApiProperty()
    rsvpDueDate: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;
}

export class InvitationResponseDto {
    @ApiProperty({ example: 'Invitation created successfully' })
    message: string;

    @ApiProperty({ type: InvitationDto })
    data: InvitationDto;
}

export class InvitationListResponseDto {
    @ApiProperty({ example: 'Invitations retrieved successfully' })
    message: string;

    @ApiProperty({ type: [InvitationDto] })
    data: InvitationDto[];

    @ApiProperty({ type: PaginationMetaDto })
    pagination: PaginationMetaDto;
}

export class InvitationMapper {
    static toDto (invitation: Invitation): InvitationDto {
        return {
            id: invitation.id,
            userId: invitation.userId,
            type: invitation.type,
            title: invitation.title,
            hosts: invitation.hosts.map((host) => ({
                name: host.name,
                title: host.title,
                relationshipWithCelebratedPerson: host.relationshipWithCelebratedPerson,
                phoneNumber: host.phoneNumber,
                email: host.email,
            })),
            celebratedPersons: invitation.celebratedPersons.map((person) => ({
                name: person.name,
                title: person.title,
                relationshipWithHost: person.relationshipWithHost,
                celebrationDate: person.celebrationDate.toISOString(),
                type: person.type,
            })),
            date: {
                gregorianDate: invitation.date.gregorianDate.toISOString(),
                hijriDate: invitation.date.hijriDate,
            },
            location: {
                address: invitation.location.address,
                wazeLink: invitation.location.wazeLink,
                googleMapsLink: invitation.location.googleMapsLink,
            },
            itineraries: invitation.itineraries.map((itinerary) => ({
                activities: itinerary.activities,
                startTime: itinerary.startTime,
                endTime: itinerary.endTime,
            })),
            contactPersons: invitation.contactPersons.map((contact) => ({
                name: contact.name,
                title: contact.title,
                relationshipWithCelebratedPerson:
                    contact.relationshipWithCelebratedPerson,
                phoneNumber: contact.phoneNumber,
                whatsappNumber: contact.whatsappNumber,
            })),
            rsvpDueDate: invitation.rsvpDueDate.toISOString(),
            createdAt: invitation.createdAt.toISOString(),
            updatedAt: invitation.updatedAt.toISOString(),
        };
    }
}
