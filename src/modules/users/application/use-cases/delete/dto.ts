import { IsString, validateSync } from 'class-validator';
import { resolveValidationErrors } from '../../../../common/infra/validation-error-resolver';
import { ValidationError } from '../../../../common/application/exceptions';
export interface DeleteUserProps {
    id: string;
}

export class DeleteUserDTO {
    @IsString()
        id: string;

    constructor (props: DeleteUserProps) {
        this.id = props.id;
    }

    static create (props: DeleteUserProps): DeleteUserDTO {
        const dto = new DeleteUserDTO(props);
        const errors = validateSync(dto);

        if (errors.length > 0) {
            const errorMessages = resolveValidationErrors(errors);
            throw new ValidationError(`Validation failed: ${errorMessages}`);
        }

        return dto;
    }
}
