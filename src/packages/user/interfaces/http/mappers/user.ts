import { User } from '@user/domain/entities/user';

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
    static toDto(user: User): UserDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            isDeleted: user.isDeleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
        };
    }

    static toListDto(users: User[]): UserDto[] {
        return users.map((u) => this.toDto(u));
    }
}
