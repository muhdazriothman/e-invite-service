import { User } from '@user/domain/entities/user';
import { RegisterResponseDto } from '@user/interfaces/http/dtos/register';
import { ListUsersResponseDto } from '@user/interfaces/http/dtos/list-users';

export interface UserDto {
    id: string;
    username: string;
    email: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export class UserMapper {
    static toDto(user: User): RegisterResponseDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }

    static toListDto(user: User): ListUsersResponseDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
}
