import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@user/domain/entities/user';
import {
    IsEmail,
    IsString,
    MinLength,
    IsEnum,
    IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
      description: 'User full name',
      example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
      name: string;

  @ApiProperty({
      description: 'User email address',
      example: 'john.doe@example.com',
  })
  @IsEmail()
      email: string;

  @ApiProperty({
      description: 'User password',
      example: 'password123',
      minLength: 6,
  })
  @IsString()
  @MinLength(6)
      password: string;

  @ApiProperty({
      description: 'User type',
      enum: UserType,
      example: UserType.USER,
  })
  @IsEnum(UserType)
      type: UserType;

  @ApiProperty({
      description: 'Payment ID associated with the user',
      example: 'pay_123456789',
  })
  @IsString()
  @IsNotEmpty()
      paymentId: string;
}
