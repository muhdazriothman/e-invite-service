import { Invitation } from '../../domain/entities/invitation';

export interface InvitationDto {
    id: string;
    title: string;
    groomsName: string;
    bridesName: string;
    firstHostName: string;
    secondHostName: string;
    weddingDate: WeddingDate;
    weddingLocation: WeddingLocation;
    itinerary: Itinerary[];
    contactPersons: ContactPersons[];
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;
}

interface WeddingDate {
    gregorionDate: Date;
    hijriDate?: string | null;
}

interface WeddingLocation {
    address: string;
    wazeLink?: string | null;
    googleMapsLink?: string | null;
}

interface Itinerary {
    activity: string;
    startTime: Date;
    endTime: Date;
}

interface ContactPersons {
    name: string;
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
}

export class InvitationMapper {
    static toDto (invitation: Invitation): InvitationDto {
        return {
            id: invitation.id,
            title: invitation.title,
            groomsName: invitation.groomsName,
            bridesName: invitation.bridesName,
            firstHostName: invitation.firstHostName,
            secondHostName: invitation.secondHostName,
            weddingDate: invitation.weddingDate,
            weddingLocation: invitation.weddingLocation,
            itinerary: invitation.itinerary,
            contactPersons: invitation.contactPersons,
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
