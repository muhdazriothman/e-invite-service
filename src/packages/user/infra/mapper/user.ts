import { User } from '../../domain/entities/user';

interface UserDto {
    id: string;
    username: string;
    role: string;
}

export class UserMapper {
    static toDto(user: User): UserDto {
        return {
            id: user.id as string,
            username: user.username,
            role: user.role
        }
    }
}