import { DateValidator } from '@shared/utils/date';
import { DateTime } from 'luxon';

describe('@shared/utils/date', () => {
    const format = 'yyyy-MM-dd';

    const dateValidator = new DateValidator({ format: format });

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15').getTime());
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('#constructor', () => {
        it('should use default format when no options provided', () => {
            const validator = new DateValidator();
            const result = validator.parseDate('2024-03-20T00:00:00.000Z');

            expect(result).toBeInstanceOf(DateTime);
        });

        it('should use custom format when provided', () => {
            const customFormat = 'dd/MM/yyyy';
            const validator = new DateValidator({ format: customFormat });
            const result = validator.parseDate('20/03/2024');

            expect(result).toBeInstanceOf(DateTime);
        });
    });

    describe('#parseDate', () => {
        it('should return a valid date using default format', () => {
            const result = dateValidator.parseDate('2024-03-20');

            expect(result).toBeInstanceOf(DateTime);
        });

        it('should return a valid date using custom format', () => {
            const customFormat = 'dd/MM/yyyy';
            const customValidator = new DateValidator({ format: customFormat });
            const result = customValidator.parseDate('20/03/2024');

            expect(result).toBeInstanceOf(DateTime);
        });

        it('should throw an error for an invalid date string', () => {
            expect(() => dateValidator.parseDate('2024-20-03')).toThrow(
                'Invalid date',
            );
        });
    });

    describe('#isValidFormat', () => {
        it('should return true for valid date format using default format', () => {
            const result = dateValidator.isValidFormat('2024-03-20');

            expect(result).toBe(true);
        });

        it('should return true for valid date format using custom format', () => {
            const customFormat = 'dd/MM/yyyy';
            const customValidator = new DateValidator({ format: customFormat });
            const result = customValidator.isValidFormat('20/03/2024');

            expect(result).toBe(true);
        });

        it('should return false for invalid date format', () => {
            const result = dateValidator.isValidFormat('2024-20-03');

            expect(result).toBe(false);
        });
    });

    describe('#isOnOrBeforeDate', () => {
        it('should return true for date before given date', () => {
            const date = DateTime.fromFormat('2024-01-14', format);
            const compareToDate = DateTime.fromFormat('2024-01-16', format);

            const result = dateValidator.isOnOrBeforeDate(
                date,
                compareToDate,
            );

            expect(result).toBe(true);
        });

        it('should return true for same date', () => {
            const date = DateTime.fromFormat('2024-01-14', format);
            const compareToDate = DateTime.fromFormat('2024-01-14', format);

            const result = dateValidator.isOnOrBeforeDate(
                date,
                compareToDate,
            );

            expect(result).toBe(true);
        });

        it('should return false for date after given date', () => {
            const date = DateTime.fromFormat('2024-01-16', format);
            const compareToDate = DateTime.fromFormat('2024-01-14', format);

            const result = dateValidator.isOnOrBeforeDate(
                date,
                compareToDate,
            );

            expect(result).toBe(false);
        });

        it('should throw an error if date is an invalid date string', () => {
            const date = DateTime.fromFormat('2024-20-03', format);
            const compareToDate = DateTime.fromFormat('2024-01-16', format);

            expect(() => dateValidator.isOnOrBeforeDate(
                date,
                compareToDate,
            )).toThrow(
                'Invalid date',
            );
        });

        it('should throw an error if compareToDate is an invalid date string', () => {
            const date = DateTime.fromFormat('2024-01-14', format);
            const compareToDate = DateTime.fromFormat('2024-20-03', format);

            expect(() => dateValidator.isOnOrBeforeDate(
                date,
                compareToDate,
            )).toThrow(
                'Invalid compareToDate',
            );
        });
    });

    describe('#getDaysBetweenDates', () => {
        it('should return the correct number of days when dateA is before dateB', () => {
            const dateA = DateTime.fromFormat('2024-01-14', format);
            const dateB = DateTime.fromFormat('2024-01-16', format);

            const result = dateValidator.getDaysBetweenDates(
                dateA,
                dateB,
            );

            expect(result).toBe(2);
        });

        it('should return the correct number of days when dateA is after dateB', () => {
            const dateA = DateTime.fromFormat('2024-01-16', format);
            const dateB = DateTime.fromFormat('2024-01-14', format);

            const result = dateValidator.getDaysBetweenDates(
                dateA,
                dateB,
            );

            expect(result).toBe(2);
        });

        it('should return 0 when both dates are the same', () => {
            const dateA = DateTime.fromFormat('2024-01-14', format);
            const dateB = DateTime.fromFormat('2024-01-14', format);

            const result = dateValidator.getDaysBetweenDates(
                dateA,
                dateB,
            );

            expect(result).toBe(0);
        });

        it('should throw an error when dateA is invalid', () => {
            const invalidDateA = DateTime.fromFormat('2024-20-03', format);
            const validDateB = DateTime.fromFormat('2024-01-16', format);

            expect(() => dateValidator.getDaysBetweenDates(
                invalidDateA,
                validDateB,
            )).toThrow(
                'Invalid dateA',
            );
        });

        it('should throw an error when dateB is invalid', () => {
            const validDateA = DateTime.fromFormat('2024-01-14', format);
            const invalidDateB = DateTime.fromFormat('2024-20-03', format);

            expect(() => dateValidator.getDaysBetweenDates(
                validDateA,
                invalidDateB,
            )).toThrow(
                'Invalid dateB',
            );
        });
    });
});
