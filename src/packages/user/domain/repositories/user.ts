import { User } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/domain/dtos/user';

export interface UserRepository {
    create(user: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findByUsername(username: string): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}
