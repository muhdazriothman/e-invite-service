import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';
import { UserType } from '@user/domain/entities/user';
import {
    HydratedDocument,
    Types,
} from 'mongoose';

export interface UserLean {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  type: UserType;
  capabilities: {
    invitationLimit: number;
  } | null;
  paymentId: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserHydrated = HydratedDocument<UserMongoDocument>;

@Schema({ versionKey: false })
export class UserMongoDocument {
    @Prop({
        required: true,
        index: true,
    })
        name: string;

    @Prop({
        required: true,
        unique: true,
        index: true,
    })
        email: string;

    @Prop({
        required: true,
    })
        passwordHash: string;

    @Prop({
        type: String,
        enum: Object.values(UserType),
        required: true,
        index: true,
    })
        type: UserType;

    @Prop({
        type: {
            invitationLimit: {
                type: Number,
                required: true,
            },
            _id: false,
        },
        required: false,
    })
        capabilities: {
            invitationLimit: number;
        } | null;

    @Prop({
        type: Types.ObjectId,
        required: false,
        index: true,
    })
        paymentId: Types.ObjectId | null;

    @Prop({
        type: Date,
        required: true,
    })
        createdAt: Date;

    @Prop({
        type: Date,
        required: true,
    })
        updatedAt: Date;

    @Prop({
        default: false,
        index: true,
    })
        isDeleted: boolean;

    @Prop({
        type: Date,
        default: null,
    })
        deletedAt: Date | null;
}

export const UserMongoSchema = SchemaFactory.createForClass(
    UserMongoDocument,
);

export const UserMongoModelName = 'User';
