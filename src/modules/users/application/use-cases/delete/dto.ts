import { IsString, validateSync } from 'class-validator';
import { resolveValidationErrors } from '../../../../common/infra/error-resolver';

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
            throw new Error(`Validation failed: ${errorMessages}`);
        }

        return dto;
    }
}
