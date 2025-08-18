import { DateValidator } from '@common/utils/date';
import { DateTime } from 'luxon';

describe('@common/utils/date', () => {
    const format = 'yyyy-MM-dd';

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15').getTime());

        jest.spyOn(DateValidator, '_isValidDate');
        jest.spyOn(DateValidator, 'parseDate');
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function assertIsValidDate(date: DateTime) {
        expect(DateValidator._isValidDate).toHaveBeenCalledWith(date);
    }

    describe('#parseDate', () => {
        it('should return a valid date', () => {
            const result = DateValidator.parseDate('2024-03-20', format);

            expect(result).toBeInstanceOf(DateTime);
        });

        it('should throw an error for an invalid date string', () => {
            expect(() => DateValidator.parseDate('2024-20-03', format)).toThrow('Invalid date');
        });
    });

    describe('#isValidFormat', () => {
        it('should return true for valid date format', () => {
            const result = DateValidator.isValidFormat('2024-03-20', format);

            expect(DateValidator.parseDate).toHaveBeenCalledWith('2024-03-20', format);

            expect(result).toBe(true);
        });

        it('should return false for invalid date format', () => {
            const result = DateValidator.isValidFormat('2024-20-03', format);

            expect(DateValidator.parseDate).toHaveBeenCalledWith('2024-03-20', format);

            expect(result).toBe(false);
        });
    });

    describe('#isPastDate', () => {
        it('should return true for past date', () => {
            const date = DateTime.fromFormat('2024-01-14', format);
            const result = DateValidator.isPastDate(date);

            assertIsValidDate(date);

            expect(result).toBe(true);
        });

        it('should return false for future date', () => {
            const date = DateTime.fromFormat('2024-01-16', format);
            const result = DateValidator.isPastDate(date);

            assertIsValidDate(date);

            expect(result).toBe(false);
        });

        it('should throw an error for an invalid date string', () => {
            const date = DateTime.fromFormat('2024-20-03', format);

            expect(() => DateValidator.isPastDate(date)).toThrow('Invalid date');

            assertIsValidDate(date);
        });
    });

    describe('#isBeforeDate', () => {
        it('should return true for date before given date', () => {
            const params = {
                targetDate: DateTime.fromFormat('2024-01-14', format),
                referenceDate: DateTime.fromFormat('2024-01-16', format),
            };

            const result = DateValidator.isBeforeDate(params);

            assertIsValidDate(params.targetDate);
            assertIsValidDate(params.referenceDate);

            expect(result).toBe(true);
        });

        it('should return true for same date', () => {
            const params = {
                targetDate: DateTime.fromFormat('2024-01-14', format),
                referenceDate: DateTime.fromFormat('2024-01-14', format),
            };

            const result = DateValidator.isBeforeDate(params);

            assertIsValidDate(params.targetDate);
            assertIsValidDate(params.referenceDate);

            expect(result).toBe(true);
        });


        it('should return false for date after given date', () => {
            const params = {
                targetDate: DateTime.fromFormat('2024-01-16', format),
                referenceDate: DateTime.fromFormat('2024-01-14', format),
            };

            const result = DateValidator.isBeforeDate(params);

            assertIsValidDate(params.targetDate);
            assertIsValidDate(params.referenceDate);

            expect(result).toBe(false);
        });

        it('should throw an error if dateToCompare is an invalid date string', () => {
            const params = {
                targetDate: DateTime.fromFormat('2024-20-03', format),
                referenceDate: DateTime.fromFormat('2024-01-16', format),
            };

            expect(() => DateValidator.isBeforeDate(params)).toThrow('Invalid targetDate');

            assertIsValidDate(params.targetDate);
            assertIsValidDate(params.referenceDate);
        });

        it('should throw an error if givenDate is an invalid date string', () => {
            const params = {
                targetDate: DateTime.fromFormat('2024-01-14', format),
                referenceDate: DateTime.fromFormat('2024-20-03', format),
            };

            expect(() => DateValidator.isBeforeDate(params)).toThrow('Invalid referenceDate');

            assertIsValidDate(params.targetDate);
            assertIsValidDate(params.referenceDate);
        });
    });

    describe('#getDaysBetweenDates', () => {
        it('should return the correct number of days between two dates when given date is before date to compare', () => {
            const params = {
                firstDate: DateTime.fromFormat('2024-01-14', format),
                secondDate: DateTime.fromFormat('2024-01-16', format),
            };

            const result = DateValidator.getDaysBetweenDates(params);

            assertIsValidDate(params.firstDate);
            assertIsValidDate(params.secondDate);

            expect(result).toBe(2);
        });

        it('should return the correct number of days between two dates when given date is after date to compare', () => {
            const params = {
                firstDate: DateTime.fromFormat('2024-01-16', format),
                secondDate: DateTime.fromFormat('2024-01-14', format),
            };

            const result = DateValidator.getDaysBetweenDates(params);

            assertIsValidDate(params.firstDate);
            assertIsValidDate(params.secondDate);

            expect(result).toBe(2);
        });

        it('should return 0 for same date', () => {
            const params = {
                firstDate: DateTime.fromFormat('2024-01-14', format),
                secondDate: DateTime.fromFormat('2024-01-14', format),
            };

            const result = DateValidator.getDaysBetweenDates(params);

            assertIsValidDate(params.firstDate);
            assertIsValidDate(params.secondDate);

            expect(result).toBe(0);
        });

        it('should throw an error if dateToCompare is an invalid date string', () => {
            const params = {
                firstDate: DateTime.fromFormat('2024-20-03', format),
                secondDate: DateTime.fromFormat('2024-01-16', format),
            };

            expect(() => DateValidator.getDaysBetweenDates(params)).toThrow('Invalid firstDate');

            assertIsValidDate(params.firstDate);
            assertIsValidDate(params.secondDate);
        });

        it('should throw an error if givenDate is an invalid date string', () => {
            const params = {
                firstDate: DateTime.fromFormat('2024-01-14', format),
                secondDate: DateTime.fromFormat('2024-20-03', format),
            };

            expect(() => DateValidator.getDaysBetweenDates(params)).toThrow('Invalid secondDate');

            assertIsValidDate(params.firstDate);
            assertIsValidDate(params.secondDate);
        });
    });
});
