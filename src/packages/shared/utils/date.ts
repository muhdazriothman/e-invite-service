import { DateTime } from 'luxon';

export interface DateValidatorOptions {
  format?: string;
}

export class DateValidator {
    private format: string;

    constructor(options: DateValidatorOptions = {}) {
        this.format = options.format || 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'';
    }

    parseDate(value: string): DateTime {
        const date = DateTime.fromFormat(value, this.format);

        if (!date.isValid) {
            throw new Error('Invalid date');
        }

        return date;
    }

    isValidFormat(value: string): boolean {
        try {
            this.parseDate(value);
            return true;
        } catch {
            return false;
        }
    }

    isOnOrBeforeDate(
        date: DateTime,
        compareToDate: DateTime,
    ): boolean {
        if (!this._isValidDate(date)) {
            throw new Error('Invalid date');
        }

        if (!this._isValidDate(compareToDate)) {
            throw new Error('Invalid compareToDate');
        }

        return date <= compareToDate;
    }

    getDaysBetweenDates(
        dateA: DateTime,
        dateB: DateTime,
    ): number {

        if (!this._isValidDate(dateA)) {
            throw new Error('Invalid dateA');
        }

        if (!this._isValidDate(dateB)) {
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

    private _isValidDate(date: DateTime): boolean {
        return date instanceof DateTime && date.isValid;
    }
}
