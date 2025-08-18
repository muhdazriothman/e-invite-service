import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/domain/repositories/user';

export class UserRepositoryImpl implements UserRepository {
    private users: User[] = [
        new User({
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: '$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC' // password: admin
        })
    ];

    findByUsername(username: string): Promise<User | null> {
        return Promise.resolve(this.users.find(user => user.username === username) || null);
    }
}