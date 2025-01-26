import { IsString, IsNotEmpty, validate, ValidationError } from 'class-validator';
import { InvalidPayloadError } from '../../../../../shared/errors/error';

interface LoginUserDtoProps {
    username: string;
    password: string;
}

export class LoginUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;

    constructor(props: LoginUserDtoProps) {
        this.username = props.username;
        this.password = props.password;
    }

    static async create(data: LoginUserDtoProps): Promise<LoginUserDto> {
        const dto = new LoginUserDto(data);

        const errors: ValidationError[] = await validate(dto);

        if (errors.length > 0) {
            const errorDetails = errors.map((error) => {
                const messages = Object.values(error.constraints || {}).join(', ');
                return `${error.property}: ${messages}`;
            });

            throw new InvalidPayloadError(errorDetails.join('; '));
        }

        return dto;
    }
}