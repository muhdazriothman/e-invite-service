export interface InvitationProps {
    id?: string;
    title: string;
    groomsName: string;
    bridesName: string;
    firstHostName: string;
    secondHostName: string;
    weddingDate: WeddingDate;
    weddingLocation: WeddingLocation;
    itinerary: Itinerary[];
    contactPersons: ContactPersons[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
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

export class Invitation {
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

    constructor (props: Invitation) {
        this.id = props.id;
        this.title = props.title;
        this.groomsName = props.groomsName;
        this.bridesName = props.bridesName;
        this.firstHostName = props.firstHostName;
        this.secondHostName = props.secondHostName;
        this.weddingDate = props.weddingDate;
        this.weddingLocation = props.weddingLocation;
        this.itinerary = props.itinerary;
        this.contactPersons = props.contactPersons;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deleted = props.deleted;
        this.deletedAt = props.deletedAt;
    }

    static create (props: InvitationProps): Invitation {
        const itinerary = [] as Itinerary[];

        for (const item of props.itinerary) {
            itinerary.push({
                activity: item.activity,
                startTime: item.startTime,
                endTime: item.endTime
            });
        }

        const contactPersons = [] as ContactPersons[];

        for (const item of props.contactPersons) {
            contactPersons.push({
                name: item.name,
                phoneNumber: item.phoneNumber ?? null,
                whatsappNumber: item.whatsappNumber ?? null
            });
        }

        return new Invitation({
            id: props.id ?? '',
            title: props.title,
            groomsName: props.groomsName,
            bridesName: props.bridesName,
            firstHostName: props.firstHostName,
            secondHostName: props.secondHostName,
            weddingDate: {
                gregorionDate: props.weddingDate.gregorionDate,
                hijriDate: props.weddingDate.hijriDate ?? null
            },
            weddingLocation: {
                address: props.weddingLocation.address,
                wazeLink: props.weddingLocation.wazeLink ?? null,
                googleMapsLink: props.weddingLocation.googleMapsLink ?? null
            },
            itinerary: props.itinerary,
            contactPersons: props.contactPersons,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
            deleted: props.deleted ?? false,
            deletedAt: props.deletedAt ?? null
        });
    }
}
