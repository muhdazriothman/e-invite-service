import {
    Invitation,
    Host,
    CelebratedPerson,
    EventDate,
    Location,
    Itinerary,
    ContactPersons,
    InvitationProps,
    InvitationType
} from '../entities/invitation';

export class InvitationFactory {
    static create(props: InvitationProps): Invitation {
        switch (props.type) {
            case InvitationType.WEDDING:
                return InvitationFactory.createForWedding(props);
            default:
                return InvitationFactory.createGeneric(props);
        }
    }

    static createForWedding(props: InvitationProps): Invitation {
        return InvitationFactory.createGeneric({
            id: props.id ?? '',
            type: InvitationType.WEDDING,
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
            deleted: props.deleted,
            deletedAt: props.deletedAt
        });
    }

    static createGeneric(props: InvitationProps): Invitation {
        return new Invitation({
            id: props.id ?? '',
            type : props.type,
            title: props.title,
            hosts: InvitationFactory.createHosts(props.hosts),
            celebratedPersons: InvitationFactory.createCelebratedPersons(props.celebratedPersons),
            date: InvitationFactory.createDate(props.date),
            location: InvitationFactory.createLocation(props.location),
            itineraries: InvitationFactory.createItineraries(props.itineraries),
            contactPersons: InvitationFactory.createContactPersons(props.contactPersons),
            rsvpDueDate: props.rsvpDueDate,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
            deleted: props.deleted ?? false,
            deletedAt: props.deletedAt ?? null
        });
    }

    static createHosts(props: Host[]): Host[] {
        const hosts = [];

        for (const host of props) {
            hosts.push({
                name: host.name,
                title: host.title,
                relationshipWithCelebratedPerson: host.relationshipWithCelebratedPerson,
                phoneNumber: host.phoneNumber ?? null,
                email: host.email ?? null
            });
        }

        return hosts;
    }

    static createCelebratedPersons(props: CelebratedPerson[]): CelebratedPerson[] {
        const celebratedPersons = [];

        for (const celebratedPerson of props) {
            celebratedPersons.push({
                name: celebratedPerson.name,
                title: celebratedPerson.title,
                relationshipWithHost: celebratedPerson.relationshipWithHost,
                celebrationDate: celebratedPerson.celebrationDate ?? null,
                type: celebratedPerson.type
            });
        }

        return celebratedPersons;
    }

    static createDate(props: EventDate): EventDate {
        return {
            gregorionDate: props.gregorionDate,
            hijriDate: props.hijriDate ?? null
        };
    }

    static createLocation(props: Location): Location {
        return {
            address: props.address,
            wazeLink: props.wazeLink ?? null,
            googleMapsLink: props.googleMapsLink ?? null
        };
    }

    static createItineraries(props: Itinerary[]): Itinerary[] {
        const itineraries = [];

        for (const itinerary of props) {
            itineraries.push({
                activities: itinerary.activities,
                startTime: itinerary.startTime,
                endTime: itinerary.endTime
            });
        }

        return itineraries;
    }

    static createContactPersons(props: ContactPersons[]): ContactPersons[] {
        const contactPersons = [];

        for (const contactPerson of props) {
            contactPersons.push({
                name: contactPerson.name,
                title: contactPerson.title,
                relationshipWithCelebratedPerson: contactPerson.relationshipWithCelebratedPerson,
                phoneNumber: contactPerson.phoneNumber ?? null,
                whatsappNumber: contactPerson.whatsappNumber ?? null
            });
        }

        return contactPersons;
    }
}
