import { DateValidator } from '@common/utils/date';
import { DateTime } from 'luxon';

describe('@common/utils/date', () => {
    const format = 'yyyy-MM-dd';

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15').getTime());
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Instance methods', () => {
        let dateValidator: DateValidator;

        beforeEach(() => {
            dateValidator = new DateValidator({ format: format });
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

        describe('#isPastDate', () => {
            it('should return true for past date', () => {
                const date = DateTime.fromFormat('2024-01-14', format);
                const result = dateValidator.isPastDate(date);

                expect(result).toBe(true);
            });

            it('should return false for future date', () => {
                const date = DateTime.fromFormat('2024-01-16', format);
                const result = dateValidator.isPastDate(date);

                expect(result).toBe(false);
            });

            it('should throw an error for an invalid date string', () => {
                const date = DateTime.fromFormat('2024-20-03', format);

                expect(() => dateValidator.isPastDate(date)).toThrow('Invalid date');
            });
        });

        describe('#isBeforeDate', () => {
            it('should return true for date before given date', () => {
                const params = {
                    targetDate: DateTime.fromFormat('2024-01-14', format),
                    referenceDate: DateTime.fromFormat('2024-01-16', format),
                };

                const result = dateValidator.isBeforeDate(params);

                expect(result).toBe(true);
            });

            it('should return true for same date', () => {
                const params = {
                    targetDate: DateTime.fromFormat('2024-01-14', format),
                    referenceDate: DateTime.fromFormat('2024-01-14', format),
                };

                const result = dateValidator.isBeforeDate(params);

                expect(result).toBe(true);
            });

            it('should return false for date after given date', () => {
                const params = {
                    targetDate: DateTime.fromFormat('2024-01-16', format),
                    referenceDate: DateTime.fromFormat('2024-01-14', format),
                };

                const result = dateValidator.isBeforeDate(params);

                expect(result).toBe(false);
            });

            it('should throw an error if dateToCompare is an invalid date string', () => {
                const params = {
                    targetDate: DateTime.fromFormat('2024-20-03', format),
                    referenceDate: DateTime.fromFormat('2024-01-16', format),
                };

                expect(() => dateValidator.isBeforeDate(params)).toThrow(
                    'Invalid targetDate',
                );
            });

            it('should throw an error if givenDate is an invalid date string', () => {
                const params = {
                    targetDate: DateTime.fromFormat('2024-01-14', format),
                    referenceDate: DateTime.fromFormat('2024-20-03', format),
                };

                expect(() => dateValidator.isBeforeDate(params)).toThrow(
                    'Invalid referenceDate',
                );
            });
        });

        describe('#getDaysBetweenDates', () => {
            it('should return the correct number of days between two dates when given date is before date to compare', () => {
                const params = {
                    firstDate: DateTime.fromFormat('2024-01-14', format),
                    secondDate: DateTime.fromFormat('2024-01-16', format),
                };

                const result = dateValidator.getDaysBetweenDates(params);

                expect(result).toBe(2);
            });

            it('should return the correct number of days between two dates when given date is after date to compare', () => {
                const params = {
                    firstDate: DateTime.fromFormat('2024-01-16', format),
                    secondDate: DateTime.fromFormat('2024-01-14', format),
                };

                const result = dateValidator.getDaysBetweenDates(params);

                expect(result).toBe(2);
            });

            it('should return 0 for same date', () => {
                const params = {
                    firstDate: DateTime.fromFormat('2024-01-14', format),
                    secondDate: DateTime.fromFormat('2024-01-14', format),
                };

                const result = dateValidator.getDaysBetweenDates(params);

                expect(result).toBe(0);
            });

            it('should throw an error if dateToCompare is an invalid date string', () => {
                const params = {
                    firstDate: DateTime.fromFormat('2024-20-03', format),
                    secondDate: DateTime.fromFormat('2024-01-16', format),
                };

                expect(() => dateValidator.getDaysBetweenDates(params)).toThrow(
                    'Invalid firstDate',
                );
            });

            it('should throw an error if givenDate is an invalid date string', () => {
                const params = {
                    firstDate: DateTime.fromFormat('2024-01-14', format),
                    secondDate: DateTime.fromFormat('2024-20-03', format),
                };

                expect(() => dateValidator.getDaysBetweenDates(params)).toThrow(
                    'Invalid secondDate',
                );
            });
        });
    });

    describe('Constructor', () => {
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
});
