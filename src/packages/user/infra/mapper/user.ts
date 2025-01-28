import { User } from '../../domain/entities/user';

interface UserDto {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;
}

export class UserMapper {
    static toDto(user: User): UserDto {
        return {
            id: user.id as string,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deleted: user.deleted,
            deletedAt: user.deletedAt
        }
    }
}