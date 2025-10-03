import {
    Payment,
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentMapper } from '@payment/interfaces/http/mapper';
import { PaymentFixture } from '@test/fixture/payment';

describe('@payment/interfaces/http/mapper', () => {
    let payment: Payment;

    beforeEach(() => {
        payment = PaymentFixture.getEntity({
            currency: 'USD',
            paymentMethod: PaymentMethod.CREDIT_CARD,
            referenceNumber: 'PAY-001',
            description: 'Test payment',
            planType: PlanType.PREMIUM,
            createdBy: 'admin-123',
        });
    });

    describe('#toDto', () => {
        it('should map payment to response DTO correctly', () => {
            const dto = PaymentMapper.toDto(payment);

            expect(dto.id).toBe(payment.id); // Will be empty string in tests
            expect(dto.amount).toBe(payment.amount);
            expect(dto.currency).toBe(payment.currency);
            expect(dto.paymentMethod).toBe(payment.paymentMethod);
            expect(dto.status).toBe(payment.status);
            expect(dto.referenceNumber).toBe(payment.referenceNumber);
            expect(dto.description).toBe(payment.description);
            expect(dto.planType).toBe(payment.planType);
            expect(dto.usedAt).toBe(payment.usedAt);
            expect(dto.createdBy).toBe(payment.createdBy);
            expect(dto.createdAt).toBe(payment.createdAt);
            expect(dto.updatedAt).toBe(payment.updatedAt);
        });
    });
});
