import { PlanType } from '@payment/domain/entities/payment';
import {
    User,
    UserType,
} from '@user/domain/entities/user';
import { UserLean } from '@user/infra/schema';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';

import { UpdateUserDto } from '../../src/packages/user/interfaces/http/dtos/update';

export class UserFixture {
    static getProps (
        props: Partial<User> = {},
    ) {
        const {
            id = '000000000000000000000001',
            name = 'testuser',
            email = 'testuser@example.com',
            passwordHash = 'hashed_password',
            type = UserType.USER,
            capabilities = {
                invitationLimit: User.getInvitationLimitFromPlanType(PlanType.BASIC),
            },
            paymentId = '000000000000000000000002',
            isDeleted = false,
            createdAt = new Date('2024-01-01'),
            updatedAt = new Date('2024-01-01'),
            deletedAt = null,
        } = props;

        return {
            id,
            name,
            email,
            passwordHash,
            type,
            capabilities,
            paymentId,
            isDeleted,
            createdAt,
            updatedAt,
            deletedAt,
        };
    }

    static getEntity (
        params: Partial<User> = {},
    ) {
        const props = UserFixture.getProps(params);
        return new User(props);
    }

    static getLean (
        params: Partial<User> = {},
    ): UserLean {
        const props = UserFixture.getProps(params);

        return {
            _id: new Types.ObjectId(props.id),
            name: props.name,
            email: props.email,
            passwordHash: props.passwordHash,
            type: props.type,
            capabilities: props.capabilities,
            paymentId: props.paymentId ? new Types.ObjectId(props.paymentId) : null,
            isDeleted: props.isDeleted,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            deletedAt: props.deletedAt,
        };
    }

    static getCreateDto (
        params: Partial<CreateUserDto> = {},
    ): CreateUserDto {

        const {
            name = 'testuser',
            email = 'testuser@example.com',
            password = 'password',
            type = UserType.USER,
            paymentId = '000000000000000000000002',
        } = params;

        const plainData = {
            name,
            email,
            password,
            type,
            paymentId,
        };

        return plainToClass(CreateUserDto, plainData);
    }

    static getCreateAdminDto (
        params: Partial<CreateAdminDto> = {},
    ): CreateAdminDto {
        const {
            name = 'Admin User',
            email = 'admin@example.com',
            password = 'password123',
        } = params;

        const plainData = {
            name,
            email,
            password,
        };

        return plainToClass(CreateAdminDto, plainData);
    }

    static getUpdateDto (
        params: Partial<UpdateUserDto> = {},
    ): UpdateUserDto {
        const {
            name = 'testuser',
            password = 'password',
        } = params;

        const plainData = {
            name,
            password,
        };

        return plainToClass(UpdateUserDto, plainData);
    }

    static getLoginDto (
        params: Partial<LoginDto> = {},
    ): LoginDto {
        const {
            username = 'testuser',
            password = 'password123',
        } = params;

        const plainData = {
            username,
            password,
        };

        return plainToClass(LoginDto, plainData);
    }
}
