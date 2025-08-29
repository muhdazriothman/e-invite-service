import {
    User,
    PlanType,
} from '@user/domain/entities/user';
import { ApiProperty } from '@nestjs/swagger';

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
            type: { type: 'string', enum: Object.values(PlanType) },
            invitationLimit: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
        },
    })
    plan: {
        type: PlanType;
        invitationLimit: number;
        name: string;
        description?: string;
    };

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
    static toDto(user: User): UserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: {
                type: user.plan.type,
                invitationLimit: user.plan.invitationLimit,
                name: user.plan.name,
                description: user.plan.description,
            },
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
}
