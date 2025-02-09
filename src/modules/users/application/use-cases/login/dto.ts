import { IsString, validateSync } from 'class-validator';
import { resolveValidationErrors } from '../../../../common/infra/validation-error-resolver';
import { ValidationError } from '../../../../common/application/exceptions';

export interface LoginUserProps {
    email: string;
    password: string;
}

export class LoginUserDTO {
    @IsString()
        email: string;

    @IsString()
        password: string;

    constructor(props: LoginUserProps) {
        this.email = props.email;
        this.password = props.password;
    }

    static create(props: LoginUserProps): LoginUserDTO {
        const dto = new LoginUserDTO(props);
        const errors = validateSync(dto);

        if (errors.length > 0) {
            const errorMessages = resolveValidationErrors(errors);
            throw new ValidationError(`Validation failed: ${errorMessages}`);
        }

        return dto;
    }
}
