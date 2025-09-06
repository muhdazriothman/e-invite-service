import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import {
    PaymentMongoSchema,
    PaymentMongoModelName,
    PaymentMongoDocument,
} from '@payment/infra/schema';
import { Types, Model } from 'mongoose';
import { TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
    setupRepositoryTest,
    MongoTestSetup,
} from '@test/utils/mongo-test-setup';
import { PaymentFixture } from '@test/fixture/payment';

describe('@payment/infra/repository', () => {
    let paymentRepository: PaymentRepository;
    let paymentModel: Model<PaymentMongoDocument>;
    let module: TestingModule;

    beforeAll(async () => {
        const testContext = await setupRepositoryTest(
            [{ name: PaymentMongoModelName, schema: PaymentMongoSchema }],
            [PaymentRepository]
        );

        module = testContext.module;
        paymentRepository = module.get<PaymentRepository>(PaymentRepository);
        paymentModel = module.get<Model<PaymentMongoDocument>>(getModelToken(PaymentMongoModelName));
    });

    afterAll(async () => {
        await module.close();
        await MongoTestSetup.stop();
    });

    beforeEach(async () => {
        await paymentModel.deleteMany({});
    });

    describe('#create', () => {
        it('should create a new payment successfully', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 25.00,
                currency: 'USD',
                reference: 'PAY-001',
                description: 'Premium plan payment',
            });

            const result = await paymentRepository.create(createPaymentData);

            expect(result).toBeInstanceOf(Payment);
            expect(result.id).toBeDefined();
            expect(result.amount).toBe(25.00);
            expect(result.currency).toBe('USD');
            expect(result.reference).toBe('PAY-001');
            expect(result.description).toBe('Premium plan payment');
            expect(result.isDeleted).toBe(false);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.deletedAt).toBeNull();

            // Verify the payment was actually saved to the database
            const savedPayment = await paymentModel.findOne({ reference: 'PAY-001' }).lean();
            expect(savedPayment).toBeDefined();
            expect(savedPayment?.amount).toBe(25.00);
            expect(savedPayment?.currency).toBe('USD');
        });

        it('should create multiple payments with different data', async () => {
            const createPaymentData1 = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const createPaymentData2 = PaymentFixture.getEntity({
                amount: 25.00,
                reference: 'PAY-002',
                description: 'Premium plan payment',
            });

            const result1 = await paymentRepository.create(createPaymentData1);
            const result2 = await paymentRepository.create(createPaymentData2);

            expect(result1).toBeInstanceOf(Payment);
            expect(result2).toBeInstanceOf(Payment);
            expect(result1.id).not.toBe(result2.id);
            expect(result1.amount).toBe(10.00);
            expect(result2.amount).toBe(25.00);

            // Verify both payments were saved
            const savedPayments = await paymentModel.find({}).lean();
            expect(savedPayments).toHaveLength(2);
        });
    });

    describe('#findAll', () => {
        it('should return all non-deleted payments', async () => {
            // Create test payments
            const createPaymentData1 = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const createPaymentData2 = PaymentFixture.getEntity({
                amount: 25.00,
                reference: 'PAY-002',
                description: 'Premium plan payment',
            });

            await paymentRepository.create(createPaymentData1);
            await paymentRepository.create(createPaymentData2);

            const result = await paymentRepository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Payment);
            expect(result[1]).toBeInstanceOf(Payment);
            expect(result[0].amount).toBe(10.00);
            expect(result[1].amount).toBe(25.00);
        });

        it('should return empty array when no payments exist', async () => {
            const result = await paymentRepository.findAll();

            expect(result).toEqual([]);
        });

        it('should exclude deleted payments from results', async () => {
            // Create a payment
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);

            // Delete the payment
            await paymentRepository.delete(payment.id);

            const result = await paymentRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('#findByReference', () => {
        it('should return a payment when found by reference', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            await paymentRepository.create(createPaymentData);

            const result = await paymentRepository.findByReference('PAY-001');

            expect(result).toBeInstanceOf(Payment);
            expect(result?.amount).toBe(10.00);
            expect(result?.reference).toBe('PAY-001');
            expect(result?.description).toBe('Basic plan payment');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when payment is not found', async () => {
            const result = await paymentRepository.findByReference('NON-EXISTENT');

            expect(result).toBeNull();
        });

        it('should exclude deleted payments from search', async () => {
            // Create a payment
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);

            // Delete the payment
            await paymentRepository.delete(payment.id);

            const result = await paymentRepository.findByReference('PAY-001');

            expect(result).toBeNull();
        });
    });

    describe('#findById', () => {
        it('should return a payment when found by id', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const createdPayment = await paymentRepository.create(createPaymentData);

            const result = await paymentRepository.findById(createdPayment.id);

            expect(result).toBeInstanceOf(Payment);
            expect(result?.id).toBe(createdPayment.id);
            expect(result?.amount).toBe(10.00);
            expect(result?.reference).toBe('PAY-001');
            expect(result?.description).toBe('Basic plan payment');
            expect(result?.isDeleted).toBe(false);
        });

        it('should return null when payment is not found', async () => {
            const result = await paymentRepository.findById(new Types.ObjectId().toString());

            expect(result).toBeNull();
        });

        it('should exclude deleted payments from search', async () => {
            // Create a payment
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);

            // Delete the payment
            await paymentRepository.delete(payment.id);

            const result = await paymentRepository.findById(payment.id);

            expect(result).toBeNull();
        });
    });

    describe('#update', () => {
        it('should update payment status successfully', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);
            const originalUpdatedAt = payment.updatedAt;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            const result = await paymentRepository.update(payment.id, {
                status: 'VERIFIED' as any,
            });

            expect(result).toBeInstanceOf(Payment);
            expect(result?.id).toBe(payment.id);
            expect(result?.amount).toBe(10.00);
            expect(result?.reference).toBe('PAY-001');
            expect(result?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

            // Verify the update was persisted
            const updatedPayment = await paymentRepository.findById(payment.id);
            expect(updatedPayment?.status).toBe('VERIFIED');
        });

        it('should return null when payment does not exist', async () => {
            const result = await paymentRepository.update(
                new Types.ObjectId().toString(),
                { status: 'VERIFIED' as any }
            );

            expect(result).toBeNull();
        });

        it('should return null when payment is deleted', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);

            // Delete the payment
            await paymentRepository.delete(payment.id);

            // Try to update deleted payment
            const result = await paymentRepository.update(payment.id, {
                status: 'VERIFIED' as any,
            });

            expect(result).toBeNull();
        });

        it('should update only specified fields', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);
            const originalAmount = payment.amount;
            const originalReference = payment.reference;

            const result = await paymentRepository.update(payment.id, {
                status: 'VERIFIED' as any,
            });

            expect(result).toBeInstanceOf(Payment);
            expect(result?.status).toBe('VERIFIED');
            expect(result?.amount).toBe(originalAmount);
            expect(result?.reference).toBe(originalReference);
        });
    });

    describe('#delete', () => {
        it('should mark a payment as deleted', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);

            const result = await paymentRepository.delete(payment.id);

            expect(result).toBe(true);

            // Verify the payment is marked as deleted
            const deletedPayment = await paymentRepository.findByReference('PAY-001');
            expect(deletedPayment).toBeNull();
        });

        it('should return false when payment does not exist', async () => {
            const result = await paymentRepository.delete(new Types.ObjectId().toString());

            expect(result).toBe(false);
        });

        it('should return false when payment is already deleted', async () => {
            const createPaymentData = PaymentFixture.getEntity({
                amount: 10.00,
                reference: 'PAY-001',
                description: 'Basic plan payment',
            });

            const payment = await paymentRepository.create(createPaymentData);

            // Delete the payment first time
            await paymentRepository.delete(payment.id);

            // Try to delete again
            const result = await paymentRepository.delete(payment.id);

            expect(result).toBe(false);
        });
    });
});