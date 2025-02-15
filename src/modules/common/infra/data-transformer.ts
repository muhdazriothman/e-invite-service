import { Transform } from 'class-transformer';
import { isISO8601 } from 'class-validator';

export const TransformToDate = () : PropertyDecorator =>
    Transform(({ value }) => {
        if (typeof value !== 'string' || !isISO8601(value)) {
            return value;
        }

        return new Date(value);
    });
