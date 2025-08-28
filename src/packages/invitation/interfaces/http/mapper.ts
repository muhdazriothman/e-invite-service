import { Invitation } from '@invitation/domain/entities/invitation';

export interface InvitationDto {
    id: string;
    type: string;
    title: string;
    hosts: Array<{
        name: string;
        title: string;
        relationshipWithCelebratedPerson: string;
        phoneNumber?: string | null;
        email?: string | null;
    }>;
    celebratedPersons: Array<{
        name: string;
        title: string;
        relationshipWithHost: string;
        celebrationDate: string;
        type: string;
    }>;
    date: {
        gregorianDate: string;
        hijriDate?: string | null;
    };
    location: {
        address: string;
        wazeLink?: string | null;
        googleMapsLink?: string | null;
    };
    itineraries: Array<{
        activities: string[];
        startTime: string;
        endTime: string;
    }>;
    contactPersons: Array<{
        name: string;
        title: string;
        relationshipWithCelebratedPerson: string;
        phoneNumber?: string | null;
        whatsappNumber?: string | null;
    }>;
    rsvpDueDate: string;
    createdAt: string;
    updatedAt: string;
}

export class InvitationMapper {
    static toDto(invitation: Invitation): InvitationDto {
        return {
            id: invitation.id,
            type: invitation.type,
            title: invitation.title,
            hosts: invitation.hosts.map(host => ({
                name: host.name,
                title: host.title,
                relationshipWithCelebratedPerson: host.relationshipWithCelebratedPerson,
                phoneNumber: host.phoneNumber,
                email: host.email,
            })),
            celebratedPersons: invitation.celebratedPersons.map(person => ({
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
            itineraries: invitation.itineraries.map(itinerary => ({
                activities: itinerary.activities,
                startTime: itinerary.startTime,
                endTime: itinerary.endTime,
            })),
            contactPersons: invitation.contactPersons.map(contact => ({
                name: contact.name,
                title: contact.title,
                relationshipWithCelebratedPerson: contact.relationshipWithCelebratedPerson,
                phoneNumber: contact.phoneNumber,
                whatsappNumber: contact.whatsappNumber,
            })),
            rsvpDueDate: invitation.rsvpDueDate.toISOString(),
            createdAt: invitation.createdAt.toISOString(),
            updatedAt: invitation.updatedAt.toISOString(),
        };
    }
}
