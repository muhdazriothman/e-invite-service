import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
