import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { UserType } from '@user/domain/entities/user';
import { Document } from 'mongoose';

export interface UserDocumentSchema {
  _id: unknown;
  name: string;
  email: string;
  passwordHash: string;
  type: UserType;
  capabilities: {
    invitationLimit: number;
  };
  paymentId: string;
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
    required: true,
    index: true,
  })
    type: UserType;

  @Prop({
    type: {
      invitationLimit: { type: Number, required: true },
      _id: false,
    },
    required: true,
  })
    capabilities: {
    invitationLimit: number;
  };

  @Prop({ required: true, index: true })
    paymentId: string;

  @Prop({ default: false, index: true })
    isDeleted: boolean;

  @Prop({ type: Date, default: null })
    deletedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserMongoSchema = SchemaFactory.createForClass(UserMongoDocument);

export const UserMongoModelName = 'User';
