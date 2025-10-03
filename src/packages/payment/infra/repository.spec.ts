import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import {
    Payment,
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import {
    PaymentHydrated,
    PaymentLean,
    PaymentMongoModelName,
    PaymentMongoSchema,
} from '@payment/infra/schema';
import { PaymentFixture } from '@test/fixture/payment';
import {
    MongoTestSetup,
    setupRepositoryTest,
} from '@test/utils/mongo-test-setup';
import {
    Model,
    Types,
} from 'mongoose';

describe('@payment/infra/repository', () => {
    let paymentRepository: PaymentRepository;
    let paymentModel: Model<PaymentHydrated>;
    let module: TestingModule;

    let spyToDomain: jest.SpyInstance;

    beforeAll(async () => {
        const testContext = await setupRepositoryTest(
            [{
                name: PaymentMongoModelName,
                schema: PaymentMongoSchema,
            }],
            [PaymentRepository],
        );

        module = testContext.module;
        paymentRepository = module.get<PaymentRepository>(PaymentRepository);
        paymentModel = module.get<Model<PaymentHydrated>>(
            getModelToken(PaymentMongoModelName),
        );
    });

    beforeEach(() => {
        spyToDomain = jest.spyOn(PaymentRepository, 'toDomain');
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await paymentModel.deleteMany({});
    });

    afterAll(async () => {
        await module.close();
        await MongoTestSetup.stop();
    });

    describe('#toDomain', () => {
        let spyCreateFromDb: jest.SpyInstance;

        beforeEach(() => {
            spyCreateFromDb = jest.spyOn(Payment, 'createFromDb');
        });

        it('should convert MongoDB document to domain entity correctly', () => {
            const document = PaymentFixture.getLean();

            const result = PaymentRepository.toDomain(document);

            expect(spyCreateFromDb).toHaveBeenCalledWith(document);

            expect(result).toBeInstanceOf(Payment);
            expect(result).toEqual({
                id: document._id.toString(),
                amount: document.amount,
                currency: document.currency,
                paymentMethod: document.paymentMethod,
                status: document.status,
                referenceNumber: document.referenceNumber,
                description: document.description,
                planType: document.planType,
                usedAt: document.usedAt,
                createdBy: document.createdBy,
                isDeleted: document.isDeleted,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                deletedAt: document.deletedAt,
            });
        });
    });

    describe('#toDocument', () => {
        it('should convert domain entity to MongoDB document correctly', () => {
            const user = PaymentFixture.getEntity();
            const document = PaymentRepository.toDocument(
                user,
                paymentModel,
            );

            expect(document).toBeInstanceOf(paymentModel);
            expect(document).toMatchObject({
                _id: expect.any(Types.ObjectId),
                amount: user.amount,
                currency: user.currency,
                paymentMethod: user.paymentMethod,
                status: user.status,
                referenceNumber: user.referenceNumber,
                description: user.description,
                planType: user.planType,
                usedAt: user.usedAt,
                createdBy: user.createdBy,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: user.deletedAt,
            });
        });
    });

    describe('#create', () => {
        it('should create a new payment successfully', async () => {
            const createPaymentData = PaymentFixture.getEntity();

            const result = await paymentRepository.create(createPaymentData);

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: new Types.ObjectId(result.id),
                amount: createPaymentData.amount,
                currency: createPaymentData.currency,
                paymentMethod: createPaymentData.paymentMethod,
                status: createPaymentData.status,
                referenceNumber: createPaymentData.referenceNumber,
                description: createPaymentData.description,
                planType: createPaymentData.planType,
                usedAt: createPaymentData.usedAt,
                createdBy: createPaymentData.createdBy,
                isDeleted: createPaymentData.isDeleted,
                createdAt: createPaymentData.createdAt,
                updatedAt: createPaymentData.updatedAt,
                deletedAt: createPaymentData.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Payment;

            expect(result).toBeInstanceOf(Payment);
            expect(result).toBe(toDomainResult);

            const createdPayment = await paymentModel
                .findOne(
                    {
                        _id: result.id,
                    },
                )
                .lean<PaymentLean>();

            expect(createdPayment).toMatchObject({
                _id: new Types.ObjectId(result.id),
                amount: createPaymentData.amount,
                currency: createPaymentData.currency,
                paymentMethod: createPaymentData.paymentMethod,
                status: createPaymentData.status,
                referenceNumber: createPaymentData.referenceNumber,
                description: createPaymentData.description,
                planType: createPaymentData.planType,
                usedAt: createPaymentData.usedAt,
                createdBy: createPaymentData.createdBy,
                isDeleted: createPaymentData.isDeleted,
                createdAt: createPaymentData.createdAt,
                updatedAt: createPaymentData.updatedAt,
                deletedAt: createPaymentData.deletedAt,
            });
        });
    });

    describe('#findAll', () => {
        it('should return all non-deleted payments', async () => {
            const payments: PaymentLean[] = [];
            for (let i = 0; i < 2; i++) {
                const createdAt = new Date(Date.now() + i * 1000);
                const payment = PaymentFixture.getLean({
                    id: `00000000000000000000000${i + 1}`,
                    referenceNumber: `PAY-00${i + 1}`,
                    createdAt,
                    updatedAt: createdAt,
                });
                payments.push(payment);
            }

            await paymentModel.create(payments);

            const result = await paymentRepository.findAll();

            expect(result).toHaveLength(payments.length);
            expect(spyToDomain).toHaveBeenCalledTimes(payments.length);

            for (let i = 0; i < payments.length; i++) {
                const payment = payments[payments.length - 1 - i];

                expect(spyToDomain).toHaveBeenNthCalledWith(i + 1, {
                    _id: payment._id,
                    amount: payment.amount,
                    currency: payment.currency,
                    paymentMethod: payment.paymentMethod,
                    status: payment.status,
                    referenceNumber: payment.referenceNumber,
                    description: payment.description,
                    planType: payment.planType,
                    usedAt: payment.usedAt,
                    createdBy: payment.createdBy,
                    isDeleted: payment.isDeleted,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                    deletedAt: payment.deletedAt,
                });

                const toDomainResult = spyToDomain.mock.results[i].value as Payment;

                expect(result[i]).toBeInstanceOf(Payment);
                expect(result[i]).toEqual(toDomainResult);
            }
        });

        it('should return empty array when no payments found', async () => {
            const result = await paymentRepository.findAll();

            expect(result).toEqual([]);
        });

        it('should exclude deleted payments from results', async () => {
            const payment = PaymentFixture.getLean({
                isDeleted: true,
            });

            await paymentModel.create(payment);

            const result = await paymentRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('#findByReference', () => {
        it('should return a payment when found by reference', async () => {
            const payment = PaymentFixture.getLean({
                referenceNumber: 'PAY-001',
            });
            await paymentModel.create(payment);

            const result = await paymentRepository.findByReferenceNumber(payment.referenceNumber);

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                referenceNumber: payment.referenceNumber,
                description: payment.description,
                planType: payment.planType,
                usedAt: payment.usedAt,
                createdBy: payment.createdBy,
                isDeleted: payment.isDeleted,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                deletedAt: payment.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Payment;

            expect(result).toBeInstanceOf(Payment);
            expect(result).toEqual(toDomainResult);
        });

        it('should return null when payment is not found', async () => {
            const result = await paymentRepository.findByReferenceNumber('NON-EXISTENT');

            expect(result).toBeNull();
        });

        it('should return null when payment is deleted', async () => {
            const payment = PaymentFixture.getLean({
                isDeleted: true,
            });
            await paymentModel.create(payment);

            const result = await paymentRepository.findByReferenceNumber(
                payment.referenceNumber,
            );

            expect(result).toBeNull();
        });
    });

    describe('#findById', () => {
        it('should return a payment when found by id', async () => {
            const payment = PaymentFixture.getLean();
            await paymentModel.create(payment);

            const result = await paymentRepository.findById(payment._id.toString());

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                referenceNumber: payment.referenceNumber,
                description: payment.description,
                planType: payment.planType,
                usedAt: payment.usedAt,
                createdBy: payment.createdBy,
                isDeleted: payment.isDeleted,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                deletedAt: payment.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Payment;

            expect(result).toBeInstanceOf(Payment);
            expect(result).toEqual(toDomainResult);
        });

        it('should return null when payment is not found', async () => {
            const result = await paymentRepository.findById(
                '000000000000000000000000',
            );

            expect(result).toBeNull();
        });

        it('should return null when payment is deleted', async () => {
            const payment = PaymentFixture.getEntity({
                isDeleted: true,
            });
            await paymentModel.create(payment);

            const result = await paymentRepository.findById(payment.id);

            expect(result).toBeNull();
        });
    });

    describe('#updateById', () => {
        const updates = {
            amount: 10.0,
            currency: 'USD',
            paymentMethod: PaymentMethod.CREDIT_CARD,
            status: PaymentStatus.VERIFIED,
            referenceNumber: 'PAY-001',
            description: 'Basic plan payment',
            planType: PlanType.BASIC,
            usedAt: new Date('2024-06-02'),
        };

        it('should update payment status successfully', async () => {
            const payment = PaymentFixture.getLean({
                amount: 20.0,
                currency: 'MYR',
                paymentMethod: PaymentMethod.BANK_TRANSFER,
                status: PaymentStatus.PENDING,
                referenceNumber: 'PAY-002',
                description: 'Premium plan payment',
                planType: PlanType.PREMIUM,
                usedAt: new Date('2024-06-03'),
            });
            await paymentModel.create(payment);

            const result = await paymentRepository.updateById(
                payment._id.toString(),
                updates,
            );

            expect(spyToDomain).toHaveBeenCalledWith({
                _id: payment._id,
                amount: updates.amount,
                currency: updates.currency,
                paymentMethod: updates.paymentMethod,
                status: updates.status,
                referenceNumber: updates.referenceNumber,
                description: updates.description,
                planType: updates.planType,
                usedAt: updates.usedAt,
                createdBy: payment.createdBy,
                isDeleted: payment.isDeleted,
                createdAt: payment.createdAt,
                updatedAt: expect.any(Date),
                deletedAt: payment.deletedAt,
            });

            const toDomainResult = spyToDomain.mock.results[0].value as Payment;

            expect(result).toBeInstanceOf(Payment);
            expect(result).toEqual(toDomainResult);

            const updatedPayment = await paymentModel.findOne({
                _id: payment._id,
            }).lean<PaymentLean>();

            expect(updatedPayment).toMatchObject({
                _id: payment._id,
                amount: updates.amount,
                currency: updates.currency,
                paymentMethod: updates.paymentMethod,
                status: updates.status,
            });

            expect(updatedPayment?.updatedAt.getTime()).toBeGreaterThan(payment.updatedAt.getTime());
        });

        it('should return null when payment does not exist', async () => {
            const result = await paymentRepository.updateById(
                '000000000000000000000001',
                updates,
            );

            expect(result).toBeNull();
        });

        it('should return null when payment is deleted', async () => {
            const payment = PaymentFixture.getEntity({
                isDeleted: true,
            });
            await paymentModel.create(payment);

            const result = await paymentRepository.updateById(
                payment.id,
                updates,
            );

            expect(result).toBeNull();
        });
    });

    describe('#deleteById', () => {
        it('should mark a payment as deleted', async () => {
            const payment = PaymentFixture.getLean();
            await paymentModel.create(payment);

            const result = await paymentRepository.deleteById(
                payment._id.toString(),
            );

            expect(result).toBe(true);

            const updatedPayment = await paymentModel.findOne({
                _id: payment._id,
            }).lean<PaymentLean>();

            expect(updatedPayment?.isDeleted).toBe(true);
            expect(updatedPayment?.deletedAt?.getTime()).toBeGreaterThan(payment.deletedAt?.getTime() ?? 0);
            expect(updatedPayment?.updatedAt.getTime()).toBeGreaterThanOrEqual(payment.updatedAt.getTime());
        });

        it('should return false when payment does not exist', async () => {
            const result = await paymentRepository.deleteById(
                '000000000000000000000001',
            );

            expect(result).toBe(false);
        });

        it('should return false when payment is already deleted', async () => {
            const payment = PaymentFixture.getLean({
                isDeleted: true,
            });
            await paymentModel.create(payment);

            const result = await paymentRepository.deleteById(
                payment._id.toString(),
            );

            expect(result).toBe(false);
        });
    });
});
