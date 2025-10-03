import { InternalServerErrorException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import { PaymentRepository } from '@payment/infra/repository';
import { PaymentFixture } from '@test/fixture/payment';
import { createMock } from '@test/utils/mocks';

describe('@payment/application/use-cases/list', () => {
    let useCase: ListPaymentsUseCase;
    let mockPaymentRepository: jest.Mocked<PaymentRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListPaymentsUseCase,
                {
                    provide: PaymentRepository,
                    useValue: createMock<PaymentRepository>(),
                },
            ],
        }).compile();

        useCase = module.get<ListPaymentsUseCase>(ListPaymentsUseCase);
        mockPaymentRepository = module.get(PaymentRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        it('should return all payments', async () => {
            const mockPayments = [
                PaymentFixture.getEntity({
                    id: '000000000000000000000001',
                    referenceNumber: 'PAY-001',
                }),
                PaymentFixture.getEntity({
                    id: '000000000000000000000002',
                    referenceNumber: 'PAY-002',
                }),
            ];

            mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

            const result = await useCase.execute();

            expect(mockPaymentRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockPayments);
        });

        it('should throw unexpected error', async () => {
            mockPaymentRepository.findAll.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute()).rejects.toThrow(
                new InternalServerErrorException(new Error('Unexpected error')),
            );

            expect(mockPaymentRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });
});
