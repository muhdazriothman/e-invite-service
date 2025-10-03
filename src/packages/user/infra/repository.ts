import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    User,
    UpdateUserProps,
} from '@user/domain/entities/user';
import {
    UserLean,
    UserHydrated,
    UserMongoModelName,
} from '@user/infra/schema';
import {
    Model,
    Types,
} from 'mongoose';

@Injectable()
export class UserRepository {
    constructor (
    @InjectModel(UserMongoModelName)
    private readonly userModel: Model<UserHydrated>,
    ) {}

    static getCollectionName (): string {
        return 'users';
    }

    static toDomain (
        document: UserLean,
    ): User {
        return User.createFromDb({
            _id: document._id,
            name: document.name,
            email: document.email,
            passwordHash: document.passwordHash,
            type: document.type,
            capabilities: document.capabilities,
            paymentId: document.paymentId,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            isDeleted: document.isDeleted,
            deletedAt: document.deletedAt,
        });
    }

    static toDocument (
        user: User,
        model: Model<UserHydrated>,
    ): UserHydrated {
        let paymentId: Types.ObjectId | null = null;
        if (user.paymentId !== null) {
            paymentId = new Types.ObjectId(user.paymentId);
        }

        return new model({
            _id: new Types.ObjectId(),
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            type: user.type,
            capabilities: user.capabilities,
            paymentId: paymentId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isDeleted: user.isDeleted,
            deletedAt: user.deletedAt,
        });
    }

    async create (
        user: User,
    ): Promise<User> {
        const document = UserRepository.toDocument(
            user,
            this.userModel,
        );

        const createdUser = (await this.userModel.create(document))
            .toObject();

        return UserRepository.toDomain(createdUser);
    }

    async findAll (): Promise<User[]> {
        const documents = await this.userModel
            .find({
                isDeleted: false,
            })
            .lean<UserHydrated[]>();

        return documents.map((document) => UserRepository.toDomain(document));
    }

    async findByName (
        name: string,
    ): Promise<User | null> {
        const document = await this.userModel
            .findOne({
                name,
                isDeleted: false,
            })
            .lean<UserHydrated>();
        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async findByEmail (
        email: string,
    ): Promise<User | null> {
        const document = await this.userModel
            .findOne({
                email,
                isDeleted: false,
            })
            .lean<UserHydrated>();
        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async findById (
        id: string,
    ): Promise<User | null> {
        const document = await this.userModel
            .findOne({
                _id: id,
                isDeleted: false,
            })
            .lean<UserHydrated>();
        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async updateById (
        id: string,
        updates: UpdateUserProps,
    ): Promise<User | null> {
        const updatesToApply: Partial<User> = {
            updatedAt: new Date(),
        };

        if (updates.name !== undefined) {
            updatesToApply.name = updates.name;
        }

        if (updates.passwordHash !== undefined) {
            updatesToApply.passwordHash = updates.passwordHash;
        }

        const document = await this.userModel
            .findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                updatesToApply,
                {
                    new: true,
                },
            )
            .lean<UserHydrated>();

        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async deleteById (
        id: string,
    ): Promise<boolean> {
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
