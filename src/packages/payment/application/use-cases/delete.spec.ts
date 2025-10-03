import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaymentService } from '@payment/application/services/payment';
import { DeletePaymentUseCase } from '@payment/application/use-cases/delete';
import { PaymentRepository } from '@payment/infra/repository';
import { paymentErrors } from '@shared/constants/error-codes';
import { PaymentFixture } from '@test/fixture/payment';
import { createMock } from '@test/utils/mocks';

describe('@payment/application/use-cases/delete', () => {
    const paymentId = '000000000000000000000001';

    let useCase: DeletePaymentUseCase;
    let mockPaymentRepository: jest.Mocked<PaymentRepository>;
    let mockPaymentService: jest.Mocked<PaymentService>;

    const payment = PaymentFixture.getEntity({
        id: paymentId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeletePaymentUseCase,
                {
                    provide: PaymentRepository,
                    useValue: createMock<PaymentRepository>(),
                },
                {
                    provide: PaymentService,
                    useValue: createMock<PaymentService>(),
                },
            ],
        }).compile();

        useCase = module.get<DeletePaymentUseCase>(DeletePaymentUseCase);
        mockPaymentRepository = module.get(PaymentRepository);
        mockPaymentService = module.get(PaymentService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        beforeEach(() => {
            mockPaymentService.findByIdOrFail.mockResolvedValue(payment);
            mockPaymentRepository.deleteById.mockResolvedValue(true);
        });

        it('should delete payment successfully', async () => {
            await expect(useCase.execute(
                paymentId,
            )).resolves.toBeUndefined();

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
            expect(mockPaymentRepository.deleteById).toHaveBeenCalledWith(paymentId);
        });

        it('should handle NotFoundException', async () => {
            const paymentId = 'non-existent';

            mockPaymentService.findByIdOrFail.mockRejectedValue(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );

            await expect(useCase.execute(paymentId)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
            expect(mockPaymentRepository.deleteById).not.toHaveBeenCalled();
        });

        it('should throw unexpected error', async () => {
            mockPaymentService.findByIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(paymentId)).rejects.toThrow(
                new InternalServerErrorException(new Error('Unexpected error')),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
            expect(mockPaymentRepository.deleteById).not.toHaveBeenCalled();
        });
    });
});
