import { IsEmail, IsString, MinLength, validateSync } from 'class-validator';
import { resolveValidationErrors } from '../../../../common/infra/validation-error-resolver';
import { ValidationError } from '../../../../common/application/exceptions';
export interface CreateUserProps {
    name: string;
    email: string;
    password: string;
}

export class CreateUserDTO {
    @IsString()
    @MinLength(3)
        name: string;

    @IsEmail()
        email: string;

    @IsString()
        password: string;

    constructor (props: CreateUserProps) {
        this.name = props.name;
        this.email = props.email;
        this.password = props.password;
    }

    static create (props: CreateUserProps): CreateUserDTO {
        const dto = new CreateUserDTO(props);
        const errors = validateSync(dto);

        if (errors.length > 0) {
            const errorMessages = resolveValidationErrors(errors);

            throw new ValidationError(`Validation failed: ${errorMessages}`);
        }

        return dto;
    }
}
