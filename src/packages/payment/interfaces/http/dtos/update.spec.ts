import {
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';
import { PaymentFixture } from '@test/fixture/payment';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('@payment/interfaces/http/dtos/update', () => {
    describe('#validation', () => {
        it('should pass validation with empty object', async () => {
            const dto = plainToClass(UpdatePaymentDto, {});
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with partial data', async () => {
            const dto = plainToClass(UpdatePaymentDto, {
                amount: 25.0,
                currency: 'USD',
            });
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with complete data', async () => {
            const dto = PaymentFixture.getUpdateDto();
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('amount', () => {
            it('should pass validation when amount is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when amount is a valid number', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    amount: 25.0,
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when amount is zero', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    amount: 0,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('amount', 'min');
            });

            it('should fail validation when amount is negative', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    amount: -10.0,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('amount', 'min');
            });

            it('should fail validation when amount is not a number', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    amount: 'not-a-number',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('amount', 'isNumber');
            });
        });

        describe('currency', () => {
            it('should pass validation when currency is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when currency is a valid 3-character string', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    currency: 'USD',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when currency is not 3 characters', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    currency: 'US',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('currency', 'isLength');
            });

            it('should fail validation when currency is not a string', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    currency: 123,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('currency', 'isString');
            });
        });

        describe('paymentMethod', () => {
            it('should pass validation when paymentMethod is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when paymentMethod is a valid enum value', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    paymentMethod: PaymentMethod.CREDIT_CARD,
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when paymentMethod is not a valid enum value', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    paymentMethod: 'invalid',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('paymentMethod', 'isEnum');
            });
        });

        describe('referenceNumber', () => {
            it('should pass validation when referenceNumber is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when referenceNumber is a valid string', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    referenceNumber: 'PAY-001',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when referenceNumber is empty', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    referenceNumber: '',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber', 'isLength');
            });

            it('should fail validation when referenceNumber is too long', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    referenceNumber: 'a'.repeat(101),
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber', 'isLength');
            });

            it('should fail validation when referenceNumber is not a string', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    referenceNumber: 123,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('referenceNumber', 'isString');
            });
        });

        describe('description', () => {
            it('should pass validation when description is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when description is a valid string', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    description: 'Updated payment description',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when description is empty', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    description: '',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('description', 'isLength');
            });

            it('should fail validation when description is too long', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    description: 'a'.repeat(501),
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('description', 'isLength');
            });

            it('should fail validation when description is not a string', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    description: 123,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('description', 'isString');
            });
        });

        describe('status', () => {
            it('should pass validation when status is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when status is a valid enum value', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    status: PaymentStatus.VERIFIED,
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when status is not a valid enum value', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    status: 'invalid',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('status', 'isEnum');
            });
        });

        describe('planType', () => {
            it('should pass validation when planType is not provided', async () => {
                const dto = plainToClass(UpdatePaymentDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when planType is a valid enum value', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    planType: PlanType.PREMIUM,
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when planType is not a valid enum value', async () => {
                const dto = plainToClass(UpdatePaymentDto, {
                    planType: 'invalid',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('planType', 'isEnum');
            });
        });
    });
});
