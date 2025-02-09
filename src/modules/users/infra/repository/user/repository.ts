import { User } from '../../../domain/entities/user';
import { UserModel, IUser } from './model';

interface Options {
    returnDeleted?: boolean;
}

export class UserRepository {
    static toDomain(document: IUser): User {
        return User.create({
            id: document._id.toString(),
            email: document.email,
            name: document.name,
            password: document.password,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            deleted: document.deleted,
            deletedAt: document.deletedAt,
        });
    }

    async create(data: Partial<User>): Promise<User> {
        const user = new UserModel(data);

        const document = await user.save();

        return UserRepository.toDomain(document);
    }

    async findAll(options: Options): Promise<User[]> {
        const {
            returnDeleted = false,
        } = options;

        const query: { deleted?: boolean } = {};

        if (!returnDeleted) {
            query.deleted = false;
        }

        const documents = await UserModel.find(query).exec();

        const users: User[] = [];

        for (const document of documents) {
            users.push(UserRepository.toDomain(document));
        }

        return users;
    }

    async findById(id: string, options: Options): Promise<User | null> {
        const {
            returnDeleted = false,
        } = options;

        const query: { _id: string; deleted?: boolean } = {
            _id: id,
        };

        if (!returnDeleted) {
            query.deleted = false;
        }

        const document = await UserModel.findOne(query).exec();

        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async findByEmail(email: string, options: Options): Promise<User | null> {
        const {
            returnDeleted = false,
        } = options;

        const query: { email: string; deleted?: boolean } = {
            email,
        };

        if (!returnDeleted) {
            query.deleted = false;
        }

        const document = await UserModel.findOne(query).exec();

        if (!document) {
            return null;
        }

        return UserRepository.toDomain(document);
    }

    async delete(id: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, {
            deleted: true,
            deletedAt: new Date(),
        }).exec();
    }
}
