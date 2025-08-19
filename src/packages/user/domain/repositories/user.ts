import { User } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/domain/dtos/user';

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
}
