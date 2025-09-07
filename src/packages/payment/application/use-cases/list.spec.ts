import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import {
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { PaymentFixture } from '@test/fixture/payment';


describe('ListPaymentsUseCase', () => {
    let useCase: ListPaymentsUseCase;
    let paymentRepository: jest.Mocked<PaymentRepository>;

    beforeEach(async() => {
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
                ListPaymentsUseCase,
                {
                    provide: 'PaymentRepository',
                    useValue: mockPaymentRepository,
                },
            ],
        }).compile();

        useCase = module.get<ListPaymentsUseCase>(ListPaymentsUseCase);
        paymentRepository = module.get('PaymentRepository');
    });

    describe('#execute', () => {
        it('should return all payments', async() => {
            const mockPayments = [
                PaymentFixture.getEntity({
                    id: 'payment-1',
                    currency: 'USD',
                    paymentMethod: PaymentMethod.BANK_TRANSFER,
                    reference: 'PAY-001',
                    description: 'Basic plan payment',
                    planType: PlanType.BASIC,
                    createdBy: 'admin-123',
                }),
                PaymentFixture.getEntity({
                    id: 'payment-2',
                    currency: 'USD',
                    paymentMethod: PaymentMethod.CREDIT_CARD,
                    reference: 'PAY-002',
                    description: 'Premium plan payment',
                    planType: PlanType.PREMIUM,
                    createdBy: 'admin-456',
                }),
            ];

            paymentRepository.findAll.mockResolvedValue(mockPayments);

            const result = await useCase.execute();

            expect(paymentRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockPayments);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no payments exist', async() => {
            paymentRepository.findAll.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(paymentRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });
});
