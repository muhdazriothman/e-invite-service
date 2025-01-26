import { IsString, IsNotEmpty, IsIn, validate, ValidationError } from 'class-validator';
import { InvalidPayloadError } from '../../../../../shared/errors/error';

interface CreateUserDtoProps {
    username: string;
    password: string;
    role: string;
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'Role is required' })
    @IsIn(['admin', 'user'], { message: 'Role must be either "admin" or "user"' })
    role!: string;

    constructor(props: CreateUserDtoProps) {
        this.username = props.username;
        this.password = props.password;
        this.role = props.role;
    }

    static async create(data: CreateUserDtoProps): Promise<CreateUserDto> {
        const dto = new CreateUserDto(data);

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