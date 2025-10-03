import {
    Payment,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentFixture } from '@test/fixture/payment';

describe('@payment/domain/entities/payment', () => {
    let props: ReturnType<typeof PaymentFixture.getProps>;

    beforeEach(() => {
        props = PaymentFixture.getProps();
    });

    describe('#constructor', () => {
        it('should create a Payment instance with provided props', () => {
            const payment = new Payment(props);

            expect(payment).toBeInstanceOf(Payment);
            expect(payment).toEqual({
                id: props.id,
                amount: props.amount,
                currency: props.currency,
                paymentMethod: props.paymentMethod,
                status: props.status,
                referenceNumber: props.referenceNumber,
                description: props.description,
                planType: props.planType,
                usedAt: props.usedAt,
                createdBy: props.createdBy,
                isDeleted: props.isDeleted,
                createdAt: props.createdAt,
                updatedAt: props.updatedAt,
                deletedAt: props.deletedAt,
            });
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

        it('should create a new Payment with correct properties', () => {
            const payment = Payment.createNew(props);

            expect(getAmountSpy).toHaveBeenCalledWith(PlanType.BASIC);
            const expectedAmount = getAmountSpy.mock.results[0].value as number;

            expect(payment).toBeInstanceOf(Payment);
            expect(payment).toMatchObject({
                id: '',
                amount: expectedAmount,
                currency: props.currency,
                paymentMethod: props.paymentMethod,
                status: PaymentStatus.VERIFIED,
                referenceNumber: props.referenceNumber,
                description: props.description,
                planType: props.planType,
                usedAt: null,
                createdBy: props.createdBy,
                isDeleted: false,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                deletedAt: null,
            });
        });
    });

    describe('#createFromDb', () => {
        it('should create a Payment from database props', () => {
            const dbProps = PaymentFixture.getLean();

            const payment = Payment.createFromDb(dbProps);

            expect(payment).toBeInstanceOf(Payment);
            expect(payment).toMatchObject({
                id: dbProps._id.toString(),
                amount: dbProps.amount,
                currency: dbProps.currency,
                paymentMethod: dbProps.paymentMethod,
                status: dbProps.status,
                referenceNumber: dbProps.referenceNumber,
                description: dbProps.description,
                planType: dbProps.planType,
                usedAt: dbProps.usedAt,
                createdBy: dbProps.createdBy,
                createdAt: dbProps.createdAt,
                updatedAt: dbProps.updatedAt,
                isDeleted: dbProps.isDeleted,
                deletedAt: dbProps.deletedAt,
            });
        });
    });

    describe('#getAmount', () => {
        it('should return correct amount for basic plan', () => {
            const amount = Payment.getAmount(PlanType.BASIC);
            expect(amount).toBe(10.0);
        });

        it('should return correct amount for premium plan', () => {
            const amount = Payment.getAmount(PlanType.PREMIUM);
            expect(amount).toBe(25.0);
        });

        it('should throw error for invalid plan type', () => {
            expect(() => {
                Payment.getAmount('invalid' as PlanType);
            }).toThrow('Invalid plan type: invalid');
        });
    });
});
