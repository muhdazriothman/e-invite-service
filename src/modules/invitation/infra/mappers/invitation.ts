import {
    Invitation,
    InvitationType,
    CelebratedPersonType,
    RelationshipType
 } from '../../domain/entities/invitation';

export interface InvitationDto {
    id: string;
    type: InvitationType;
    title: string;
    hosts: Host[];
    celebratedPersons: CelebratedPerson[];
    date: EventDate;
    location: Location;
    itineraries: Itinerary[];
    contactPersons: ContactPersons[];
    rsdpDueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;
}

interface Host {
    name: string;
    title: string;
    relationshipWithCelebratedPerson: RelationshipType;
    phoneNumber?: string | null;
    email?: string | null;
}

interface CelebratedPerson {
    name: string;
    title: string;
    relationshipWithHost: RelationshipType;
    celebrationDate: Date;
    type: CelebratedPersonType;
}

interface EventDate {
    gregorionDate: Date;
    hijriDate?: string | null;
}

interface Location {
    address: string;
    wazeLink?: string | null;
    googleMapsLink?: string | null;
}

interface Itinerary {
    activities: string[];
    startTime: Date;
    endTime: Date;
}

interface ContactPersons {
    name: string;
    title: string;
    relationshipWithCelebratedPerson: RelationshipType;
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
}

export class InvitationMapper {
    static toDto (invitation: Invitation): InvitationDto {
        return {
            id: invitation.id,
            type: invitation.type,
            title: invitation.title,
            hosts: invitation.hosts,
            celebratedPersons: invitation.celebratedPersons,
            date: invitation.date,
            location: invitation.location,
            itineraries: invitation.itineraries,
            contactPersons: invitation.contactPersons,
            rsdpDueDate: invitation.rsvpDueDate,
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
            deleted : invitation.deleted,
            deletedAt: invitation.deletedAt
        };
    }

    static toDtos (invitations: Invitation[]): InvitationDto[] {
        const invitationsDto: InvitationDto[] = [];

        for (const invitation of invitations) {
            invitationsDto.push(InvitationMapper.toDto(invitation));
        }

        return invitationsDto;
    }
}
