import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserMongoDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;
}

export const UserMongoSchema = SchemaFactory.createForClass(UserMongoDocument);

export const UserMongoModelName = 'User';
