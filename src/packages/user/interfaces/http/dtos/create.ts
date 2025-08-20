import {
    IsEmail,
    IsString,
    MinLength,
    IsEnum
} from 'class-validator';

import { UserType } from '@user/domain/entities/user';

export class CreateUserDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(UserType)
    type: UserType;
}

