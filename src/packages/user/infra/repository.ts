import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@user/domain/entities/user';
import {
    UserMongoDocument,
    UserMongoModelName,
    UserDocumentSchema
} from '@user/infra/schema';
import { UserProps } from '@user/domain/entities/user';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(UserMongoModelName)
        private readonly userModel: Model<UserMongoDocument>,
    ) { }

    static getCollectionName(): string {
        return 'users';
    }

    private toDomain(doc: UserDocumentSchema): User {
        return User.createFromDb({
            id: (doc._id as unknown)?.toString() ?? '',
            name: doc.name,
            email: doc.email,
            passwordHash: doc.passwordHash,
            type: doc.type,
            isDeleted: doc.isDeleted ?? false,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt ?? null,
        });
    }

    async create(user: User): Promise<User> {
        const userData = {
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            type: user.type,
        };

        const created = await this.userModel.create(userData);
        const doc = created.toObject();
        return this.toDomain(doc);
    }

    async findAll(): Promise<User[]> {
        const docs = await this.userModel.find({ isDeleted: false }).lean();

        return docs.map(doc => this.toDomain(doc));
    }

    async findByName(name: string): Promise<User | null> {
        const doc = await this.userModel.findOne({ name, isDeleted: false }).lean();
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    async findByEmail(email: string): Promise<User | null> {
        const doc = await this.userModel.findOne({ email, isDeleted: false }).lean();
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    async findById(id: string): Promise<User | null> {
        const doc = await this.userModel.findOne({ _id: id, isDeleted: false }).lean();
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    async update(id: string, updates: Partial<Pick<UserProps, 'name' | 'passwordHash'>>): Promise<User | null> {
        const updateData = {
            ...updates,
            updatedAt: new Date(),
        };

        const result = await this.userModel.findOneAndUpdate(
            {
                _id: id,
                isDeleted: false
            },
            updateData,
            {
                new: true,
                lean: true
            }
        );

        if (!result) {
            return null;
        }

        return this.toDomain(result);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { _id: id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() }
        );

        return result.modifiedCount > 0;
    }
}
