import {
    InvitationType,
    CelebratedPersonType,
    RelationshipType
} from '../../../domain/entities/invitation';

import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
    _id: string;
    type: InvitationType;
    title: string;
    hosts: Array<{
        name: string;
        title: string;
        relationshipWithCelebratedPerson: RelationshipType;
        phoneNumber?: string | null;
        email?: string | null;
    }>;
    celebratedPersons: Array<{
        name: string;
        title: string;
        relationshipWithHost: RelationshipType;
        celebrationDate: Date;
        type: CelebratedPersonType;
    }>;
    date: {
        gregorionDate: Date;
        hijriDate?: string | null;
    };
    location: {
        address: string;
        wazeLink?: string | null;
        googleMapsLink?: string | null;
    };
    itineraries: Array<{
        activities: string[];
        startTime: Date;
        endTime: Date;
    }>;
    contactPersons: Array<{
        name: string;
        title: string;
        relationshipWithCelebratedPerson: RelationshipType;
        phoneNumber?: string | null;
        whatsappNumber?: string | null;
    }>;
    rsvpDueDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
}

const InvitationSchema: Schema = new Schema(
    {
        type: {
            type: String,
            enum: Object.values(InvitationType),
            required: true
        },
        title: {
            type: String,
            required: true
        },
        hosts: [{
            name: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            relationshipWithCelebratedPerson: {
                type: String,
                enum: Object.values(RelationshipType),
                required: true
            },
            phoneNumber: {
                type: String,
                default: null
            },
            email: {
                type: String,
                default: null
            }
        }],
        celebratedPersons: [{
            name: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            relationshipWithHost: {
                type: String,
                enum: Object.values(RelationshipType),
                required: true
            },
            celebrationDate: {
                type: Date,
                required: true
            },
            type: {
                type: String,
                enum: Object.values(CelebratedPersonType),
                required: true
            }
        }],
        date: {
            gregorionDate: {
                type: Date,
                required: true
            },
            hijriDate: {
                type: String,
                default: null
            }
        },
        location: {
            address: {
                type: String,
                required: true
            },
            wazeLink: {
                type: String,
                default: null
            },
            googleMapsLink: {
                type: String,
                default: null
            }
        },
        itineraries: [{
            activities: [{
                type: [String],
                required: true
            }],
            startTime: {
                type: Date,
                required: true
            },
            endTime: {
                type: Date,
                required: true
            }
        }],
        contactPersons: [{
            name: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            relationshipWithCelebratedPerson: {
                type: String,
                enum: Object.values(RelationshipType),
                required: true
            },
            phoneNumber: {
                type: String,
                default: null
            },
            whatsappNumber: {
                type: String,
                default: null
            }
        }],
        rsvpDueDate: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    }
);

export const InvitationModel = mongoose.model<IInvitation>('Invitation', InvitationSchema);
