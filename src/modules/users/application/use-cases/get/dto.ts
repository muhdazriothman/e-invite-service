import { IsString, validateSync } from 'class-validator';
import { resolveValidationErrors } from '../../../../common/infra/validation-error-resolver';
import { ValidationError } from '../../../../common/application/exceptions';

export interface GetUserProps {
    id: string;
}

export class GetUserDTO {
    @IsString()
        id: string;

    constructor (props: GetUserProps) {
        this.id = props.id;
    }

    static create (props: GetUserProps): GetUserDTO {
        const dto = new GetUserDTO(props);
        const errors = validateSync(dto);

        if (errors.length > 0) {
            const errorMessages = resolveValidationErrors(errors);
            throw new ValidationError(`Validation failed: ${errorMessages}`);
        }

        return dto;
    }
}
