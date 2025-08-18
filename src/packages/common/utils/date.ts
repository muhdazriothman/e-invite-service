import { DateTime } from 'luxon';

export interface ParseDateParams {
    date: string;
    format: string;
}

interface DateComparisonParams {
    targetDate: DateTime;
    referenceDate: DateTime;
}

interface DaysBetweenDatesParams {
    firstDate: DateTime;
    secondDate: DateTime;
}

export class DateValidator {
    static parseDate(value: string, format: string): DateTime {
        const date = DateTime.fromFormat(value, format);

        if (!date.isValid) {
            throw new Error('Invalid date');
        }

        return date;
    }

    static isValidFormat(value: any, format: string): boolean {
        try {
            DateValidator.parseDate(value, format);
            return true;
        } catch (error) {
            return false;
        }
    }

    static isPastDate(date: DateTime): boolean {
        if (!DateValidator._isValidDate(date)) {
            throw new Error('Invalid date');
        }

        return date < DateTime.utc();
    }

    static isBeforeDate(params: DateComparisonParams): boolean {
        const {
            targetDate,
            referenceDate,
        } = params;

        if (!DateValidator._isValidDate(targetDate)) {
            throw new Error('Invalid targetDate');
        }

        if (!DateValidator._isValidDate(referenceDate)) {
            throw new Error('Invalid referenceDate');
        }

        return targetDate <= referenceDate;
    }

    static getDaysBetweenDates(params: DaysBetweenDatesParams): number {
        const {
            firstDate,
            secondDate,
        } = params;

        if (!DateValidator._isValidDate(firstDate)) {
            throw new Error('Invalid firstDate');
        }

        if (!DateValidator._isValidDate(secondDate)) {
            throw new Error('Invalid secondDate');
        }

        let startDate = firstDate;
        let endDate = secondDate;

        if (firstDate > secondDate) {
            startDate = secondDate;
            endDate = firstDate;
        }

        return endDate.diff(startDate, 'days').days;
    }

    static _isValidDate(date: DateTime): boolean {
        return date instanceof DateTime && date.isValid;
    }
}
