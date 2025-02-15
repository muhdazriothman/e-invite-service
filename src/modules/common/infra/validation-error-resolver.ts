import { ValidationError } from 'class-validator';

interface ProcessErrorParams {
    error: ValidationError;
    formattedErrors: string[];
    parentPath?: string;
}

export class ValidationErrorResolver {
    static resolveValidationErrors(errors: ValidationError | ValidationError[]): string[] {
        if (!errors) {
            return [];
        }

        const formattedErrors: string[] = [];

        if (Array.isArray(errors)) {
            for (const error of errors) {
                ValidationErrorResolver.processError({ error, formattedErrors });
            }
        } else {
            ValidationErrorResolver.processError({ error: errors, formattedErrors });
        }

        return formattedErrors;
    }

    static processError(params: ProcessErrorParams): void {
        const {
            error,
            formattedErrors,
            parentPath = ''
        } = params;

        const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;

        if (error.constraints) {
            const errorMessages = Object.values(error.constraints);

            for (const message of errorMessages) {
                formattedErrors.push(`${propertyPath}: ${message}`);
            }
        }

        if (error.children && error.children.length > 0) {
            for (const childError of error.children) {
                ValidationErrorResolver.processError({ error: childError, formattedErrors, parentPath: propertyPath });
            }
        }
    }
}
