import {
    CelebratedPersonDto,
    CreateInvitationDto,
} from '@invitation/interfaces/http/dtos/create';

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
    NEIGHBOUR = 'neighbour'
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
    gregorianDate: Date;
    hijriDate?: string | null;
}

export interface Location {
    address: string;
    wazeLink?: string | null;
    googleMapsLink?: string | null;
}

export interface Itinerary {
    activities: string[];
    startTime: string;
    endTime: string;
}

export interface ContactPerson {
    name: string;
    title: string;
    relationshipWithCelebratedPerson: RelationshipType;
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
}

export interface InvitationProps {
    id: string;
    userId: string;
    type: InvitationType;
    title: string;
    hosts: Host[];
    celebratedPersons: CelebratedPerson[];
    date: EventDate;
    location: Location;
    itineraries: Itinerary[];
    contactPersons: ContactPerson[];
    rsvpDueDate: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface CreateInvitationProps {
    userId: string;
    type: InvitationType;
    title: string;
    hosts: Host[];
    celebratedPersons: CelebratedPerson[];
    date: EventDate;
    location: Location;
    itineraries: Itinerary[];
    contactPersons: ContactPerson[];
    rsvpDueDate: Date;
}

export class Invitation {
    public readonly id: string;
    public readonly userId: string;
    public type: InvitationType;
    public title: string;
    public hosts: Host[];
    public celebratedPersons: CelebratedPerson[];
    public date: EventDate;
    public location: Location;
    public itineraries: Itinerary[];
    public contactPersons: ContactPerson[];
    public rsvpDueDate: Date;
    public isDeleted: boolean;
    public readonly createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor(props: InvitationProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.type = props.type;
        this.title = props.title;
        this.hosts = props.hosts;
        this.celebratedPersons = props.celebratedPersons;
        this.date = props.date;
        this.location = props.location;
        this.itineraries = props.itineraries;
        this.contactPersons = props.contactPersons;
        this.rsvpDueDate = props.rsvpDueDate;
        this.isDeleted = props.isDeleted;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
    }

    static createNew(dto: CreateInvitationDto, userId: string): Invitation {
        const now = new Date();

        const celebratedPersons: CelebratedPerson[] = [];
        for (const person of dto.celebratedPersons) {
            celebratedPersons.push({
                name: person.name,
                title: person.title,
                relationshipWithHost: person.relationshipWithHost,

                type: person.type,
                celebrationDate: new Date(person.celebrationDate),
            });
        }

        return new Invitation({
            id: '', // Will be set by the database
            userId,
            type: dto.type,
            title: dto.title,
            hosts: dto.hosts,
            celebratedPersons,
            date: {
                gregorianDate: new Date(dto.date.gregorianDate),
                hijriDate: dto.date.hijriDate,
            },
            location: dto.location,
            itineraries: dto.itineraries,
            contactPersons: dto.contactPersons,
            rsvpDueDate: new Date(dto.rsvpDueDate),
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        });
    }

    static createFromDb(props: InvitationProps): Invitation {
        return new Invitation(props);
    }
}
