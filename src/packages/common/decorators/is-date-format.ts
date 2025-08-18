import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

import { DateValidator } from '@common/utils/date';

export function IsDateFormat(format: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isDateFormat',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return DateValidator.isValidFormat(value, format);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid date in ${format} format`;
                },
            },
        });
    };
}
