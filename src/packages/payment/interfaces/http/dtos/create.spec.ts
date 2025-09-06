import { validate } from 'class-validator';
import { CreatePaymentDto } from './create';
import { PaymentMethod, PlanType } from '@payment/domain/entities/payment';

describe('@payment/interfaces/http/dtos/create', () => {
    let dto: CreatePaymentDto;

    beforeEach(() => {
        dto = new CreatePaymentDto();
    });

    describe('validation', () => {
        it('should pass validation with valid data', async () => {
            dto.currency = 'USD';
            dto.paymentMethod = PaymentMethod.CREDIT_CARD;
            dto.reference = 'PAY-001';
            dto.description = 'Test payment';
            dto.planType = PlanType.PREMIUM;

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should pass validation without optional description', async () => {
            dto.currency = 'EUR';
            dto.paymentMethod = PaymentMethod.BANK_TRANSFER;
            dto.reference = 'PAY-002';
            dto.planType = PlanType.BASIC;

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        describe('currency', () => {
            it('should pass validation with valid currency', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with invalid currency length', async () => {
                dto.currency = 'US';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('currency');
                expect(errors[0].constraints).toHaveProperty('isLength');
            });

            it('should fail validation with empty currency', async () => {
                dto.currency = '';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('currency');
                expect(errors[0].constraints).toHaveProperty('isLength');
            });
        });

        describe('paymentMethod', () => {
            it('should pass validation with valid payment method', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with invalid payment method', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = 'invalid' as any;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('paymentMethod');
                expect(errors[0].constraints).toHaveProperty('isEnum');
            });
        });

        describe('reference', () => {
            it('should pass validation with valid reference', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with empty reference', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = '';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('reference');
                expect(errors[0].constraints).toHaveProperty('isLength');
            });

            it('should fail validation with too long reference', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'a'.repeat(101);
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('reference');
                expect(errors[0].constraints).toHaveProperty('isLength');
            });
        });

        describe('planType', () => {
            it('should pass validation with valid plan type', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = PlanType.BASIC;

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with invalid plan type', async () => {
                dto.currency = 'USD';
                dto.paymentMethod = PaymentMethod.CREDIT_CARD;
                dto.reference = 'PAY-001';
                dto.planType = 'invalid' as any;

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('planType');
                expect(errors[0].constraints).toHaveProperty('isEnum');
            });
        });
    });
});
