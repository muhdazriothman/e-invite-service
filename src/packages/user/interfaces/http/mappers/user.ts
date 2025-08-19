import { User } from '@user/domain/entities/user';

export interface UserDto {
  id: string;
  username: string;
  email: string;
}

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  static toListDto(users: User[]): UserDto[] {
    return users.map((u) => this.toDto(u));
  }
}
