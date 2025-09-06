import { NotFoundException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import {
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { PaymentFixture } from '@test/fixture/payment';

import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';

describe('@payment/application/use-cases/get-by-id', () => {
    let useCase: GetPaymentByIdUseCase;
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
                GetPaymentByIdUseCase,
                {
                    provide: 'PaymentRepository',
                    useValue: mockPaymentRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetPaymentByIdUseCase>(GetPaymentByIdUseCase);
        paymentRepository = module.get('PaymentRepository');
    });

    describe('#execute', () => {
        it('should return payment when found', async () => {
            const paymentId = 'payment-123';
            const mockPayment = PaymentFixture.getEntity({
                id: paymentId,
                currency: 'USD',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                reference: 'PAY-001',
                description: 'Premium plan payment',
                planType: PlanType.PREMIUM,
                createdBy: 'admin-123',
            });

            paymentRepository.findById.mockResolvedValue(mockPayment);

            const result = await useCase.execute(paymentId);

            expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId);
            expect(result).toEqual(mockPayment);
        });

        it('should throw NotFoundException when payment not found', async () => {
            const paymentId = 'non-existent';

            paymentRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(paymentId)).rejects.toThrow(
                NotFoundException,
            );

            expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId);
        });
    });
});
