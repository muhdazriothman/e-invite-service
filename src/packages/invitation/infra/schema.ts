import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
    InvitationType,
    CelebratedPersonType,
    RelationshipType,
    Host,
    CelebratedPerson,
    EventDate,
    Location,
    Itinerary,
    ContactPerson,
} from '@invitation/domain/entities/invitation';

export interface InvitationDocumentSchema {
    _id: unknown;
    type: InvitationType;
    title: string;
    hosts: Host[];
    celebratedPersons: CelebratedPerson[];
    date: EventDate;
    location: Location;
    itineraries: Itinerary[];
    contactPersons: ContactPerson[];
    rsvpDueDate: Date;
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

@Schema({ timestamps: true })
export class InvitationMongoDocument extends Document {
    @Prop({
        type: String,
        enum: Object.values(InvitationType),
        required: true,
        index: true
    })
    type: InvitationType;

    @Prop({ required: true })
    title: string;

    @Prop({
        type: [{
            name: { type: String, required: true },
            title: { type: String, required: true },
            relationshipWithCelebratedPerson: {
                type: String,
                enum: Object.values(RelationshipType),
                required: true
            },
            phoneNumber: { type: String, default: null },
            email: { type: String, default: null },
            _id: false
        }],
        required: true
    })
    hosts: Host[];

    @Prop({
        type: [{
            name: { type: String, required: true },
            title: { type: String, required: true },
            relationshipWithHost: {
                type: String,
                enum: Object.values(RelationshipType),
                required: true
            },
            celebrationDate: { type: Date, required: true },
            type: {
                type: String,
                enum: Object.values(CelebratedPersonType),
                required: true
            },
            _id: false
        }],
        required: true
    })
    celebratedPersons: CelebratedPerson[];

    @Prop({
        type: {
            gregorianDate: { type: Date, required: true },
            hijriDate: { type: String, default: null },
            _id: false
        },
        required: true
    })
    date: EventDate;

    @Prop({
        type: {
            address: { type: String, required: true },
            wazeLink: { type: String, default: null },
            googleMapsLink: { type: String, default: null },
            _id: false
        },
        required: true
    })
    location: Location;

    @Prop({
        type: [{
            activities: [{ type: String }],
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            _id: false
        }],
        required: true
    })
    itineraries: Itinerary[];

    @Prop({
        type: [{
            name: { type: String, required: true },
            title: { type: String, required: true },
            relationshipWithCelebratedPerson: {
                type: String,
                enum: Object.values(RelationshipType),
                required: true
            },
            phoneNumber: { type: String, default: null },
            whatsappNumber: { type: String, default: null },
            _id: false
        }],
        required: true
    })
    contactPersons: ContactPerson[];

    @Prop({ required: true })
    rsvpDueDate: Date;

    @Prop({ default: false, index: true })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const InvitationMongoSchema = SchemaFactory.createForClass(InvitationMongoDocument);

export const InvitationMongoModelName = 'Invitation';
