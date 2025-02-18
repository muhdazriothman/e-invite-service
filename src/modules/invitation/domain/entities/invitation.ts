export enum InvitationType {
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

export enum CelebratedPersonType {
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

export enum RelationshipType {
    PARENT = 'parent',
    CHILD = 'child',
    SIBLING = 'sibling',
    SPOUSE = 'spouse',
    FRIEND = 'friend',
    RELATIVE = 'relative',
    COLLEAGUE = 'colleague',
    NEIGHBOR = 'neighbor'
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

export interface Host {
    name: string;
    title: string;
    relationshipWithCelebratedPerson: RelationshipType;
    phoneNumber?: string | null;
    email?: string | null;
}

export interface CelebratedPerson {
    name: string;
    title: string;
    relationshipWithHost: RelationshipType;
    celebrationDate: Date;
    type: CelebratedPersonType;
}

export interface EventDate {
    gregorionDate: Date;
    hijriDate?: string | null;
}

export interface Location {
    address: string;
    wazeLink?: string | null;
    googleMapsLink?: string | null;
}

export interface Itinerary {
    activities: string[];
    startTime: Date;
    endTime: Date;
}

export interface ContactPersons {
    name: string;
    title: string;
    relationshipWithCelebratedPerson: RelationshipType;
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
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
}
