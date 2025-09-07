import {
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
      name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
      password?: string;
}
