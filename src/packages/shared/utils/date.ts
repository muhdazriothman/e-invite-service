import { DateTime } from 'luxon';

export interface DateValidatorOptions {
  format?: string;
}

export class DateValidator {
    private format: string;

    constructor (options: DateValidatorOptions = {}) {
        this.format = options.format || 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'';
    }

    parseDate (
        value: string,
    ): DateTime {
        const date = DateTime.fromFormat(value, this.format);

        if (!date.isValid) {
            throw new Error('Invalid date');
        }

        return date;
    }

    isValidFormat (
        value: string,
    ): boolean {
        try {
            this.parseDate(value);
            return true;
        } catch {
            return false;
        }
    }

    static isOnOrBeforeDate (
        date: DateTime,
        compareToDate: DateTime,
    ): boolean {
        if (!DateValidator._isValidDate(date)) {
            throw new Error('Invalid date');
        }

        if (!DateValidator._isValidDate(compareToDate)) {
            throw new Error('Invalid compareToDate');
        }

        return date <= compareToDate;
    }

    static getDaysBetweenDates (
        dateA: DateTime,
        dateB: DateTime,
    ): number {

        if (!DateValidator._isValidDate(dateA)) {
            throw new Error('Invalid dateA');
        }

        if (!DateValidator._isValidDate(dateB)) {
            throw new Error('Invalid dateB');
        }

        let startDate = dateA;
        let endDate = dateB;

        if (dateA > dateB) {
            startDate = dateB;
            endDate = dateA;
        }

        return endDate.diff(startDate, 'days').days;
    }

    private static _isValidDate (date: DateTime): boolean {
        return date instanceof DateTime && date.isValid;
    }
}
