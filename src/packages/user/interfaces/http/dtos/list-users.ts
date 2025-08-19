import { IsString, IsDateString, IsOptional } from 'class-validator';

export class ListUsersResponseDto {
    @IsString()
    id: string;

    @IsString()
    username: string;

    @IsString()
    email: string;

    @IsDateString()
    @IsOptional()
    createdAt?: string;

    @IsDateString()
    @IsOptional()
    updatedAt?: string;
}
