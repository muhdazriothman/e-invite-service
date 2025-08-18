import { validate } from 'class-validator';

import { IsDateFormat } from '@common/decorators/is-date-format';

class TestClass {
    @IsDateFormat('yyyy-MM-dd')
    date: string;
}

describe('@common/decorators/is-date-format', () => {
    let testClass: TestClass;

    beforeEach(() => {
        testClass = new TestClass();
    });

    it('should validate correct date format', async () => {
        testClass.date = '2024-03-20';
        const errors = await validate(testClass);
        expect(errors.length).toBe(0);
    });

    it('should reject incorrect date format', async () => {
        testClass.date = '20-03-2024';
        const errors = await validate(testClass);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints?.isDateFormat).toBe('date must be a valid date in yyyy-MM-dd format');
    });

    it('should reject invalid date', async () => {
        testClass.date = '2024-13-45';
        const errors = await validate(testClass);
        expect(errors.length).toBe(1);
    });

    it('should reject non-string values', async () => {
        // @ts-ignore - Testing invalid type
        testClass.date = 123;
        const errors = await validate(testClass);
        expect(errors.length).toBe(1);
    });

    it('should reject empty string', async () => {
        testClass.date = '';
        const errors = await validate(testClass);
        expect(errors.length).toBe(1);
    });
});