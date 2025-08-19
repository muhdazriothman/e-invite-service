import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/domain/repositories/user';
import {
    UserMongoDocument,
    UserMongoModelName,
} from '@user/infra/schemas/user';
import { CreateUserDto } from '@user/domain/dtos/user';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
    constructor(
        @InjectModel(UserMongoModelName)
        private readonly userModel: Model<UserMongoDocument>,
    ) { }

    async create(user: CreateUserDto): Promise<User> {
        const created = await this.userModel.create(user);
        const doc = created.toObject();
        return new User({
            id: (doc as any)._id?.toString?.() ?? '',
            username: doc.username,
            email: doc.email,
            passwordHash: doc.passwordHash,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt,
        });
    }

    async findAll(): Promise<User[]> {
        const docs = await this.userModel.find({ isDeleted: false }).lean();

        return docs.map(doc => new User({
            id: (doc as any)._id?.toString?.() ?? '',
            username: doc.username,
            email: doc.email,
            passwordHash: doc.passwordHash,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt,
        }));
    }

    async findByUsername(username: string): Promise<User | null> {
        const doc = await this.userModel.findOne({ username, isDeleted: false }).lean();
        if (!doc) return null;

        return new User({
            id: (doc as any)._id?.toString?.() ?? '',
            username: doc.username,
            email: doc.email,
            passwordHash: doc.passwordHash,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt,
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { _id: id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() }
        );
        return result.modifiedCount > 0;
    }
}
