import { User } from '@user/domain/entities/user';

export interface UserDto {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export class UserMapper {
    static toDto(user: User): UserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
}
