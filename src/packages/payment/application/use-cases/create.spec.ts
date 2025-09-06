import { ConflictException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import {
    Payment,
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';
import { PaymentFixture } from '@test/fixture/payment';

import { CreatePaymentUseCase } from '@payment/application/use-cases/create';

describe('@payment/application/use-cases/create', () => {
    let useCase: CreatePaymentUseCase;
    let paymentRepository: jest.Mocked<PaymentRepository>;

    beforeEach(async () => {
        const mockPaymentRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByReference: jest.fn(),
            findAll: jest.fn(),
            findAvailableForUserCreation: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreatePaymentUseCase,
                {
                    provide: 'PaymentRepository',
                    useValue: mockPaymentRepository,
                },
            ],
        }).compile();

        useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
        paymentRepository = module.get('PaymentRepository');
    });

    describe('#execute', () => {
        it('should create a new payment successfully', async () => {
            const createPaymentDto: CreatePaymentDto = {
                currency: 'USD',
                paymentMethod: PaymentMethod.BANK_TRANSFER,
                reference: 'PAY-001',
                description: 'Test payment',
                planType: PlanType.BASIC,
            };
            const createdBy = 'admin-123';

            const expectedPayment = PaymentFixture.getEntity({
                currency: createPaymentDto.currency,
                paymentMethod: createPaymentDto.paymentMethod,
                reference: createPaymentDto.reference,
                description: createPaymentDto.description,
                planType: createPaymentDto.planType,
                createdBy,
                status: PaymentStatus.PENDING,
            });

            paymentRepository.findByReference.mockResolvedValue(null);
            paymentRepository.create.mockResolvedValue(expectedPayment);

            const result = await useCase.execute(createPaymentDto, createdBy);

            expect(paymentRepository.findByReference).toHaveBeenCalledWith(
                createPaymentDto.reference,
            );
            expect(paymentRepository.create).toHaveBeenCalledWith(
                expect.any(Payment),
            );
            expect(result).toEqual(expectedPayment);
            expect(result.status).toBe(PaymentStatus.PENDING);
        });

        it('should throw ConflictException when payment reference already exists', async () => {
            const createPaymentDto: CreatePaymentDto = {
                currency: 'USD',
                paymentMethod: PaymentMethod.BANK_TRANSFER,
                reference: 'PAY-001',
                description: 'Test payment',
                planType: PlanType.BASIC,
            };
            const createdBy = 'admin-123';

            const existingPayment = PaymentFixture.getEntity({
                currency: createPaymentDto.currency,
                paymentMethod: createPaymentDto.paymentMethod,
                reference: createPaymentDto.reference,
                description: createPaymentDto.description,
                planType: createPaymentDto.planType,
                createdBy: 'admin-456',
            });

            paymentRepository.findByReference.mockResolvedValue(existingPayment);

            await expect(
                useCase.execute(createPaymentDto, createdBy),
            ).rejects.toThrow(ConflictException);

            expect(paymentRepository.findByReference).toHaveBeenCalledWith(
                createPaymentDto.reference,
            );
            expect(paymentRepository.create).not.toHaveBeenCalled();
        });
    });
});
