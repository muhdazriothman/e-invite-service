import { ValidationError } from 'class-validator';

export function resolveValidationErrors (errors: ValidationError[]): string {
    return errors
        .map(error => {
            const constraints = error.constraints ? Object.values(error.constraints).join(', ') : '';
            return `${error.property}: ${constraints}`;
        })
        .join(' | ');
}
