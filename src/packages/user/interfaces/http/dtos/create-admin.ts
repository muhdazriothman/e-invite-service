import {
    IsEmail,
    IsString,
    MinLength,
    IsNotEmpty,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
      name: string;

  @IsEmail()
      email: string;

  @IsString()
  @MinLength(6)
      password: string;
}
