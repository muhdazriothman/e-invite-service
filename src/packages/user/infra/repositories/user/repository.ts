import { UserModel } from './model';
import { User } from '../../../domain/entities/user';

export class UserRepository {
    toDomain(document: any): User {
        return new User({
            id: document._id.toString(),
            username: document.username,
            password: document.password,
            role: document.role,
        });
    }

    toMongoose(user: User): any {
        return {
            username: user.username,
            password: user.password,
            role: user.role,
        };
    }

    async create(user: User): Promise<User> {
        const document = new UserModel(this.toMongoose(user));
        await document.save();
        return this.toDomain(document);
    }

    async findByUsername(username: string): Promise<User | null> {
        const mongooseUser = await UserModel.findOne({ username }).exec();
        return mongooseUser ? this.toDomain(mongooseUser) : null;
    }
}