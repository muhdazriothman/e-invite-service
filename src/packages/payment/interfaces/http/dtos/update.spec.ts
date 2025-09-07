import {
  PaymentMethod,
  PaymentStatus,
  PlanType,
} from '@payment/domain/entities/payment';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';
import { validate } from 'class-validator';


describe('@payment/interfaces/http/dtos/update', () => {
  let dto: UpdatePaymentDto;

  beforeEach(() => {
    dto = new UpdatePaymentDto();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async() => {
      dto.amount = 25.0;
      dto.currency = 'USD';
      dto.paymentMethod = PaymentMethod.CREDIT_CARD;
      dto.reference = 'PAY-001';
      dto.description = 'Updated payment';
      dto.status = PaymentStatus.VERIFIED;
      dto.planType = PlanType.PREMIUM;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object (all optional fields)', async() => {
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('amount', () => {
      it('should pass validation with valid amount', async() => {
        dto.amount = 10.0;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with zero amount', async() => {
        dto.amount = 0;

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('amount');
        expect(errors[0].constraints).toHaveProperty('min');
      });

      it('should fail validation with negative amount', async() => {
        dto.amount = -10.0;

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('amount');
        expect(errors[0].constraints).toHaveProperty('min');
      });
    });

    describe('currency', () => {
      it('should pass validation with valid currency', async() => {
        dto.currency = 'USD';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with invalid currency length', async() => {
        dto.currency = 'US';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('currency');
        expect(errors[0].constraints).toHaveProperty('isLength');
      });
    });

    describe('paymentMethod', () => {
      it('should pass validation with valid payment method', async() => {
        dto.paymentMethod = PaymentMethod.BANK_TRANSFER;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with invalid payment method', async() => {
        // @ts-expect-error Testing invalid enum value
        dto.paymentMethod = 'invalid';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('paymentMethod');
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('reference', () => {
      it('should pass validation with valid reference', async() => {
        dto.reference = 'PAY-001';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with empty reference', async() => {
        dto.reference = '';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('reference');
        expect(errors[0].constraints).toHaveProperty('isLength');
      });
    });

    describe('status', () => {
      it('should pass validation with valid status', async() => {
        dto.status = PaymentStatus.VERIFIED;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with invalid status', async() => {
        // @ts-expect-error Testing invalid enum value
        dto.status = 'invalid';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('status');
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('planType', () => {
      it('should pass validation with valid plan type', async() => {
        dto.planType = PlanType.BASIC;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail validation with invalid plan type', async() => {
        // @ts-expect-error Testing invalid enum value
        dto.planType = 'invalid';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('planType');
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });
  });
});
