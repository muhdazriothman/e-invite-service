import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

import { DateValidator } from '@shared/utils/date';

export function IsDateFormat(
    format: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isDateFormat',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    const dateValidator = new DateValidator({ format: format });
                    return dateValidator.isValidFormat(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid date in ${format} format`;
                },
            },
        });
    };
}
