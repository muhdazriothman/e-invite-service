import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
    _id: string;
    title: string;
    groomsName: string;
    bridesName: string;
    firstHostName: string;
    secondHostName: string;
    weddingDate: {
        gregorionDate: Date;
        hijriDate?: string;
    };
    weddingLocation: {
        address: string;
        wazeLink?: string;
        googleMapsLink?: string;
    };
    itinerary: Array<{
        activity: string;
        startTime: Date;
        endTime: Date;
    }>;
    contactPersons: Array<{
        name: string;
        phoneNumber?: string;
        whatsappNumber?: string;
    }>;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
}

const InvitationSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        groomsName: { type: String, required: true },
        bridesName: { type: String, required: true },
        firstHostName: { type: String, required: true },
        secondHostName: { type: String, required: true },
        weddingDate: {
            gregorionDate: { type: Date, required: true },
            hijriDate: { type: String, required: false }
        },
        weddingLocation: {
            address: { type: String, required: true },
            wazeLink: { type: String, required: false },
            googleMapsLink: { type: String, required: false }
        },
        itinerary: [{
            activity: { type: String, required: true },
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true }
        }],
        contactPersons: [{
            name: { type: String, required: true },
            phoneNumber: { type: String, required: false },
            whatsappNumber: { type: String, required: false }
        }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    }
);

export const InvitationModel = mongoose.model<IInvitation>('Invitation', InvitationSchema);
