import { UserType } from '@user/domain/entities/user';
import {
    IsEmail,
    IsString,
    MinLength,
    IsEnum,
    IsUUID,
    IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
      name: string;

  @IsEmail()
      email: string;

  @IsString()
  @MinLength(6)
      password: string;

  @IsEnum(UserType)
      type: UserType;

  @IsUUID()
      paymentId: string;
}
