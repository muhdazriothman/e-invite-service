import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;
}

export class RegisterResponseDto {
    @IsString()
    id: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsDateString()
    createdAt: string;

    @IsDateString()
    updatedAt: string;
}
