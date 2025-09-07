import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    User,
    UserProps,
} from '@user/domain/entities/user';
import {
    UserMongoDocument,
    UserMongoModelName,
    UserDocumentSchema,
} from '@user/infra/schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
    constructor(
    @InjectModel(UserMongoModelName)
    private readonly userModel: Model<UserMongoDocument>,
    ) {}

    static getCollectionName(): string {
        return 'users';
    }

    static toDomain(doc: UserDocumentSchema): User {
        return User.createFromDb({
            id: doc._id?.toString() ?? '',
            name: doc.name,
            email: doc.email,
            passwordHash: doc.passwordHash,
            type: doc.type,
            capabilities: doc.capabilities,
            paymentId: doc.paymentId,
            isDeleted: doc.isDeleted ?? false,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt ?? null,
        });
    }

    async create(user: User): Promise<User> {
        const createdUser = await this.userModel.create({
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            type: user.type,
            capabilities: user.capabilities,
            paymentId: user.paymentId,
            isDeleted: user.isDeleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
        });

        const document = createdUser.toObject();
        return UserRepository.toDomain(document);
    }

    async findAll(): Promise<User[]> {
        const documents = await this.userModel
            .find({
                isDeleted: false,
            })
            .lean();

        return documents.map((document) => UserRepository.toDomain(document));
    }

    async findByName(name: string): Promise<User | null> {
        const document = await this.userModel
            .findOne({
                name,
                isDeleted: false,
            })
            .lean();
        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async findByEmail(email: string): Promise<User | null> {
        const document = await this.userModel
            .findOne({
                email,
                isDeleted: false,
            })
            .lean();
        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async findById(id: string): Promise<User | null> {
        const document = await this.userModel
            .findOne({
                _id: id,
                isDeleted: false,
            })
            .lean();
        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async update(
        id: string,
        updates: Partial<Pick<UserProps, 'name' | 'passwordHash'>>,
    ): Promise<User | null> {
        const updateData = {
            ...updates,
            updatedAt: new Date(),
        };

        const document = await this.userModel.findOneAndUpdate(
            {
                _id: id,
                isDeleted: false,
            },
            updateData,
            {
                new: true,
                lean: true,
            },
        );

        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userModel.updateOne(
            {
                _id: id,
                isDeleted: false,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return result.modifiedCount > 0;
    }
}
