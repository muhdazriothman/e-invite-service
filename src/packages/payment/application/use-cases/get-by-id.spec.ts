import {
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaymentService } from '@payment/application/services/payment';
import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';
import { paymentErrors } from '@shared/constants/error-codes';
import { PaymentFixture } from '@test/fixture/payment';
import { createMock } from '@test/utils/mocks';

describe('@payment/application/use-cases/get-by-id', () => {
    const paymentId = '000000000000000000000001';

    let useCase: GetPaymentByIdUseCase;
    let mockPaymentService: jest.Mocked<PaymentService>;

    const payment = PaymentFixture.getEntity({
        id: paymentId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetPaymentByIdUseCase,
                {
                    provide: PaymentService,
                    useValue: createMock<PaymentService>(),
                },
            ],
        }).compile();

        useCase = module.get<GetPaymentByIdUseCase>(GetPaymentByIdUseCase);
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
        });

        it('should return payment when found', async () => {;
            const result = await useCase.execute(paymentId);

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
            expect(result).toEqual(payment);
        });

        it('should handle NotFoundException', async () => {
            const paymentId = 'non-existent';

            mockPaymentService.findByIdOrFail.mockRejectedValue(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );

            await expect(useCase.execute(paymentId)).rejects.toThrow(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
        });

        it('should throw unexpected error', async () => {
            mockPaymentService.findByIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(paymentId)).rejects.toThrow(
                new InternalServerErrorException(new Error('Unexpected error')),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
        });
    });
});
