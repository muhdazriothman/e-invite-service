import {
    Payment,
    PaymentStatus,
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';

describe('@payment/domain/entities/payment', () => {
    let payment: Payment;
    let paymentProps: any;

    beforeEach(() => {
        paymentProps = {
            id: '1',
            amount: 100.00,
            currency: 'USD',
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            status: PaymentStatus.PENDING,
            reference: 'PAY-001',
            description: 'Test payment',
            planType: PlanType.BASIC,
            verifiedAt: null,
            usedAt: null,
            createdBy: 'admin-123',
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        };
    });

    describe('#constructor', () => {
        it('should create a Payment instance with provided props', () => {
            payment = new Payment(paymentProps);

            expect(payment.id).toBe(paymentProps.id);
            expect(payment.amount).toBe(paymentProps.amount);
            expect(payment.currency).toBe(paymentProps.currency);
            expect(payment.paymentMethod).toBe(paymentProps.paymentMethod);
            expect(payment.status).toBe(paymentProps.status);
            expect(payment.reference).toBe(paymentProps.reference);
            expect(payment.description).toBe(paymentProps.description);
            expect(payment.planType).toBe(paymentProps.planType);
            expect(payment.usedAt).toBe(paymentProps.usedAt);
            expect(payment.createdBy).toBe(paymentProps.createdBy);
            expect(payment.isDeleted).toBe(paymentProps.isDeleted);
            expect(payment.createdAt).toBe(paymentProps.createdAt);
            expect(payment.updatedAt).toBe(paymentProps.updatedAt);
            expect(payment.deletedAt).toBe(paymentProps.deletedAt);
        });
    });

    describe('#createNew', () => {
        let getAmountSpy: jest.SpyInstance;

        beforeEach(() => {
            getAmountSpy = jest.spyOn(Payment, 'getAmount');
        });

        afterEach(() => {
            getAmountSpy.mockRestore();
        });

        it('should create a new Payment with default values', () => {
            const createProps = {
                currency: 'EUR',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                reference: 'PAY-002',
                description: 'New payment',
                planType: PlanType.BASIC,
                createdBy: 'admin-456',
            };

            payment = Payment.createNew(createProps);

            expect(getAmountSpy).toHaveBeenCalledWith(PlanType.BASIC);
            const expectedAmount = getAmountSpy.mock.results[0].value;

            expect(payment.id).toBe('');
            expect(payment.amount).toBe(expectedAmount);
            expect(payment.currency).toBe(createProps.currency);
            expect(payment.paymentMethod).toBe(createProps.paymentMethod);
            expect(payment.status).toBe(PaymentStatus.PENDING);
            expect(payment.reference).toBe(createProps.reference);
            expect(payment.description).toBe(createProps.description);
            expect(payment.planType).toBe(createProps.planType);
            expect(payment.usedAt).toBeNull();
            expect(payment.createdBy).toBe(createProps.createdBy);
            expect(payment.isDeleted).toBe(false);
            expect(payment.createdAt).toBeInstanceOf(Date);
            expect(payment.updatedAt).toBeInstanceOf(Date);
            expect(payment.deletedAt).toBeNull();
        });
    });

    describe('#createFromDb', () => {
        it('should create a Payment from database props', () => {
            const dbProps = {
                ...paymentProps,
                planType: PlanType.PREMIUM,
            };

            payment = Payment.createFromDb(dbProps);

            expect(payment.id).toBe(dbProps.id);
            expect(payment.amount).toBe(dbProps.amount);
            expect(payment.currency).toBe(dbProps.currency);
            expect(payment.paymentMethod).toBe(dbProps.paymentMethod);
            expect(payment.status).toBe(dbProps.status);
            expect(payment.reference).toBe(dbProps.reference);
            expect(payment.description).toBe(dbProps.description);
            expect(payment.planType).toBe(dbProps.planType);
            expect(payment.usedAt).toBe(dbProps.usedAt);
            expect(payment.createdBy).toBe(dbProps.createdBy);
            expect(payment.isDeleted).toBe(dbProps.isDeleted);
            expect(payment.createdAt).toBe(dbProps.createdAt);
            expect(payment.updatedAt).toBe(dbProps.updatedAt);
            expect(payment.deletedAt).toBe(dbProps.deletedAt);
        });
    });

    describe('#getAmount', () => {
        it('should return correct amount for basic plan', () => {
            const amount = Payment.getAmount(PlanType.BASIC);
            expect(amount).toBe(10.00);
        });

        it('should return correct amount for premium plan', () => {
            const amount = Payment.getAmount(PlanType.PREMIUM);
            expect(amount).toBe(25.00);
        });

        it('should throw error for invalid plan type', () => {
            expect(() => {
                Payment.getAmount('invalid' as PlanType);
            }).toThrow('Invalid plan type: invalid');
        });
    });
});