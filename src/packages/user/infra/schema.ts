import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

import { UserType } from '@user/domain/entities/user';

export interface UserDocumentSchema {
    _id: unknown;
    name: string;
    email: string;
    passwordHash: string;
    type: UserType;
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

@Schema({ timestamps: true })
export class UserMongoDocument extends Document {
    @Prop({ required: true, index: true })
    name: string;

    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({
        type: String,
        enum: Object.values(UserType),
        default: UserType.USER,
        required: true
    })
    type: UserType;

    @Prop({ default: false, index: true })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const UserMongoSchema = SchemaFactory.createForClass(UserMongoDocument);

export const UserMongoModelName = 'User';
