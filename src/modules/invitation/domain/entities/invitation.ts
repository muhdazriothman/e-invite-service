enum InvitationType {
    WEDDING = 'wedding',
    BIRTHDAY = 'birthday',
    CORPORATE = 'corporate',
    BABY_SHOWER = 'baby_shower',
    BRIDAL_SHOWER = 'bridal_shower',
    ENGAGEMENT = 'engagement',
    GRADUATION = 'graduation',
    HOUSE_WARMING = 'house_warming',
    ANNIVERSARY = 'anniversary',
    FAREWELL = 'farewell',
    WELCOME = 'welcome',
    OTHER = 'other'
}

enum CelebratedPersonType {
    GROOM = 'groom',
    BRIDE = 'bride',
    CHILD = 'child',
    PARENT = 'parent',
    GRADUATE = 'graduate',
    HOME_OWNER = 'home_owner',
    COUPLE = 'couple',
    HONOREE = 'honoree',
    OTHER = 'other'
}

export interface InvitationProps {
    id?: string;
    type: InvitationType;
    title: string;
    hosts: Host[];
    celebratedPersons: CelebratedPerson[];
    date: EventDate;
    location: Location;
    itineraries: Itinerary[];
    contactPersons: ContactPersons[];
    rsvpDueDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
}

interface Host {
    name: string;
    title?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
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
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
}

interface CelebratedPerson {
    name: string;
    celebrationDate: Date;
    type: CelebratedPersonType;
}

export class Invitation {
    id: string;
    type: InvitationType;
    title: string;
    hosts: Host[];
    celebratedPersons: CelebratedPerson[];
    date: EventDate;
    location: Location;
    itineraries: Itinerary[];
    contactPersons: ContactPersons[];
    rsvpDueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;

    constructor (props: Invitation) {
        this.id = props.id;
        this.type = props.type;
        this.title = props.title;
        this.hosts = props.hosts;
        this.celebratedPersons = props.celebratedPersons;
        this.date = props.date;
        this.location = props.location;
        this.itineraries = props.itineraries;
        this.contactPersons = props.contactPersons;
        this.rsvpDueDate = props.rsvpDueDate;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deleted = props.deleted;
        this.deletedAt = props.deletedAt;
     }

     static createForWedding (props: InvitationProps): Invitation {
        const hosts = Invitation.createHost(props.hosts);
        const celebratedPersons = Invitation.createCelebratedPerson(props.celebratedPersons);
        const itineraries = Invitation.createItinerary(props.itineraries);
        const contactPersons = Invitation.createContactPersons(props.contactPersons);

        return new Invitation({
            id: props.id ?? '',
            type: InvitationType.WEDDING,
            title: props.title,
            hosts,
            celebratedPersons,
            date: {
                gregorionDate: props.date.gregorionDate,
                hijriDate: props.date.hijriDate ?? null
            },
            location: {
                address: props.location.address,
                wazeLink: props.location.wazeLink ?? null,
                googleMapsLink: props.location.googleMapsLink ?? null
            },
            itineraries,
            contactPersons,
            rsvpDueDate: props.rsvpDueDate,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
            deleted: props.deleted ?? false,
            deletedAt: props.deletedAt ?? null
        });
    }

    static createHost(props: Host[]): Host[] {
        const hosts = [] as Host[];

        for (const item of props) {
            hosts.push({
                name: item.name,
                title: item.title ?? null,
                phoneNumber: item.phoneNumber ?? null,
                email: item.email ?? null
            });
        }

        return hosts;
    }

    static createCelebratedPerson(props: CelebratedPerson[]): CelebratedPerson[] {
        const celebratedPersons = [] as CelebratedPerson[];

        for (const item of props) {
            celebratedPersons.push({
                name: item.name,
                celebrationDate: item.celebrationDate ?? null,
                type: item.type
            });
        }

        return celebratedPersons;
    }

    static createItinerary(props: Itinerary[]): Itinerary[] {
        const itineraries = [] as Itinerary[];

        for (const item of props) {
            itineraries.push({
                activities: item.activities,
                startTime: item.startTime,
                endTime: item.endTime
            });
        }

        return itineraries;
    }

    static createContactPersons(props: ContactPersons[]): ContactPersons[] {
        const contactPersons = [] as ContactPersons[];

        for (const item of props) {
            contactPersons.push({
                name: item.name,
                phoneNumber: item.phoneNumber ?? null,
                whatsappNumber: item.whatsappNumber ?? null
            });
        }

        return contactPersons;
    }
}
