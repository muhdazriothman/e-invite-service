import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserType } from '@user/domain/entities/user';

@Schema({ timestamps: true })
export class UserMongoDocument extends Document {
    @Prop({ required: true, unique: true, index: true })
    username: string;

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
    userType: UserType;

    @Prop({ default: false, index: true })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const UserMongoSchema = SchemaFactory.createForClass(UserMongoDocument);

export const UserMongoModelName = 'User';
