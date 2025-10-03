import { ApiProperty } from '@nestjs/swagger';
import { User } from '@user/domain/entities/user';

export class UserDto {
  @ApiProperty()
      id: string;

  @ApiProperty()
      name: string;

  @ApiProperty()
      email: string;

  @ApiProperty({
      type: 'object',
      properties: {
          invitationLimit: { type: 'number' },
      },
      nullable: true,
  })
      capabilities: {
    invitationLimit: number;
  } | null;

  @ApiProperty()
      createdAt: string;

  @ApiProperty()
      updatedAt: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'User created successfully' })
      message: string;

  @ApiProperty({ type: UserDto })
      data: UserDto;
}

export class UserListResponseDto {
  @ApiProperty({ example: 'Users retrieved successfully' })
      message: string;

  @ApiProperty({ type: [UserDto] })
      data: UserDto[];
}

export class UserMapper {
    static toDto (user: User): UserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            capabilities: user.capabilities,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
}
