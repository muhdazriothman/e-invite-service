import { Transform } from 'class-transformer';
import { isISO8601, registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function TransformToDate(): PropertyDecorator {
    return Transform(({ value }) => {
        if (typeof value !== 'string' || !isISO8601(value)) {
            return value;
        }

        
return new Date(value);
    });
}

@ValidatorConstraint({ async: false })
export class IsValidDateConstraint implements ValidatorConstraintInterface {
    validate(value: Date): boolean {
        return value instanceof Date && !isNaN(value.getTime());
    }

    defaultMessage(args: ValidationArguments): string {
        const fieldName = args.property;
        const customMessage = args.constraints[0];

        return customMessage || `${fieldName} must be a valid date`;
    }
}

export function IsDate(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string): void {
        TransformToDate()(object, propertyName); // Apply Transform

        registerDecorator({
            name: 'IsDate',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [validationOptions?.message], // Pass custom message if provided
            options: validationOptions,
            validator: IsValidDateConstraint
        });
    };
}
