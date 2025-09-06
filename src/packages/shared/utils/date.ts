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
    } catch (error) {
      return false;
    }
  }

  isPastDate(date: DateTime): boolean {
    if (!this._isValidDate(date)) {
      throw new Error('Invalid date');
    }

    return date < DateTime.utc();
  }

  isBeforeDate(params: DateComparisonParams): boolean {
    const { targetDate, referenceDate } = params;

    if (!this._isValidDate(targetDate)) {
      throw new Error('Invalid targetDate');
    }

    if (!this._isValidDate(referenceDate)) {
      throw new Error('Invalid referenceDate');
    }

    return targetDate <= referenceDate;
  }

  getDaysBetweenDates(params: DaysBetweenDatesParams): number {
    const { firstDate, secondDate } = params;

    if (!this._isValidDate(firstDate)) {
      throw new Error('Invalid firstDate');
    }

    if (!this._isValidDate(secondDate)) {
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

  private _isValidDate(date: DateTime): boolean {
    return date instanceof DateTime && date.isValid;
  }
}
