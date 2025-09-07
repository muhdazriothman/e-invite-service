import {
    Payment,
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';

export class PaymentFixture {
    static getPaymentProps(props: Partial<Payment> = {}) {
        const {
            id = 'payment-id-123',
            amount = 10.0,
            currency = 'USD',
            paymentMethod = PaymentMethod.CASH,
            status = PaymentStatus.VERIFIED,
            reference = 'REF-123456',
            description = 'Test payment',
            planType = PlanType.BASIC,
            usedAt = null,
            createdBy = 'admin-id-123',
            isDeleted = false,
            createdAt = new Date(),
            updatedAt = new Date(),
            deletedAt = null,
        } = props;

        return {
            id,
            amount,
            currency,
            paymentMethod,
            status,
            reference,
            description,
            planType,
            usedAt,
            createdBy,
            isDeleted,
            createdAt,
            updatedAt,
            deletedAt,
        };
    }

    static getEntity(params: Partial<Payment> = {}) {
        const props = PaymentFixture.getPaymentProps(params);
        return Payment.createFromDb(props);
    }

    static getPendingPayment() {
        return PaymentFixture.getEntity({
            id: 'payment-id-456',
            status: PaymentStatus.PENDING,
        });
    }

    static getUsedPayment() {
        return PaymentFixture.getEntity({
            id: 'payment-id-789',
            status: PaymentStatus.USED,
            usedAt: new Date(),
        });
    }

    static getPremiumPayment() {
        return PaymentFixture.getEntity({
            id: 'payment-id-premium',
            planType: PlanType.PREMIUM,
            amount: 25.0,
        });
    }
}
