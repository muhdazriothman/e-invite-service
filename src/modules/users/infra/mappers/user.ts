import { User } from '../../domain/entities/user';

export interface UserDTO {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;
}

export class UserMapper {
    static toDTO (user: User): UserDTO {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deleted: user.deleted,
            deletedAt: user.deletedAt
        };
    }

    static toDTOs (users: User[]): UserDTO[] {
        const usersDto: UserDTO[] = [];

        for (const user of users) {
            usersDto.push(UserMapper.toDTO(user));
        }

        return usersDto;
    }
}
