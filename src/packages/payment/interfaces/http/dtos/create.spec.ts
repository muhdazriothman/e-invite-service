import {
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';
import { PaymentFixture } from '@test/fixture/payment';
import { validate } from 'class-validator';

describe('@payment/interfaces/http/dtos/create', () => {
    let dto: CreatePaymentDto;

    beforeEach(() => {
        dto = PaymentFixture.getCreateDto();
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('amount', () => {
            it('should fail validation when amount is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.amount;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('amount');
            });

            it('should fail validation when amount is not a number', async () => {
                // @ts-expect-error - we want to test the validation
                dto.amount = 'invalid';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('amount', 'isNumber');
            });

            it('should fail validation when amount is less than 0.01', async () => {
                dto.amount = 0.005;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('amount', 'min');
            });

            it('should pass validation when amount is exactly 0.01', async () => {
                dto.amount = 0.01;

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });
        });

        describe('currency', () => {
            it('should fail validation when currency is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.currency;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('currency');
            });

            it('should fail validation when currency is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.currency = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('currency', 'isString');
            });

            it('should fail validation when currency length is less than 3', async () => {
                dto.currency = 'US';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('currency', 'isLength');
            });

            it('should fail validation when currency length is more than 3', async () => {
                dto.currency = 'USDD';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('currency', 'isLength');
            });
        });

        describe('paymentMethod', () => {
            const validPaymentMethods = [
                PaymentMethod.CREDIT_CARD,
                PaymentMethod.BANK_TRANSFER,
                PaymentMethod.CASH,
                PaymentMethod.OTHER,
            ];

            for (const paymentMethod of validPaymentMethods) {
                it(`should pass validation when paymentMethod is ${paymentMethod}`, async () => {
                    dto.paymentMethod = paymentMethod;

                    const errors = await validate(dto);
                    expect(errors).toHaveLength(0);
                });
            }

            it('should fail validation when paymentMethod is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.paymentMethod;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('paymentMethod');
            });

            it('should fail validation when paymentMethod is not a valid enum value', async () => {
                // @ts-expect-error - we want to test the validation
                dto.paymentMethod = 'invalid';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('paymentMethod', 'isEnum');
            });
        });

        describe('referenceNumber', () => {
            it('should fail validation when referenceNumber is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.referenceNumber;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber');
            });

            it('should fail validation when referenceNumber is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.referenceNumber = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber', 'isString');
            });

            it('should fail validation when referenceNumber is empty', async () => {
                dto.referenceNumber = '';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber', 'isLength');
            });

            it('should fail validation when referenceNumber is too long', async () => {
                dto.referenceNumber = 'a'.repeat(101);

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber', 'isLength');
            });
        });

        describe('description', () => {
            it('should pass validation when description is provided', async () => {
                dto.description = 'Payment for premium plan';

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when description is null', async () => {
                dto.description = null;

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when description is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.description;

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when description is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.description = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('description', 'isString');
            });

            it('should fail validation when description is empty string', async () => {
                dto.description = '';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('description', 'isLength');
            });

            it('should fail validation when description is too long', async () => {
                dto.description = 'A'.repeat(501);

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('description', 'isLength');
            });
        });

        describe('planType', () => {
            const validPlanTypes = [
                PlanType.BASIC,
                PlanType.PREMIUM,
            ];

            for (const planType of validPlanTypes) {
                it(`should pass validation when planType is ${planType}`, async () => {
                    dto.planType = planType;

                    const errors = await validate(dto);
                    expect(errors).toHaveLength(0);
                });
            }

            it('should fail validation when planType is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.planType;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('planType');
            });

            it('should fail validation when planType is not a valid enum value', async () => {
                // @ts-expect-error - we want to test the validation
                dto.planType = 'invalid';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('planType', 'isEnum');
            });
        });
    });
});
