import { IsString, validateSync } from 'class-validator';
import { resolveValidationErrors } from '../../../../common/infra/error-resolver';

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
            throw new Error(`Validation failed: ${errorMessages}`);
        }

        return dto;
    }
}
