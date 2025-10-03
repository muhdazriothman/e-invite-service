import {
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaymentService } from '@payment/application/services/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { paymentErrors } from '@shared/constants/error-codes';
import { PaymentFixture } from '@test/fixture/payment';
import { createMock } from '@test/utils/mocks';

describe('@payment/application/services/payment', () => {
    const paymentId = '000000000000000000000002';
    const referenceNumber = 'PAY-001';

    let service: PaymentService;
    let mockPaymentRepository: jest.Mocked<PaymentRepository>;

    const payment = PaymentFixture.getEntity({
        id: paymentId,
        referenceNumber,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: PaymentRepository,
                    useValue: createMock<PaymentRepository>(),
                },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        mockPaymentRepository = module.get(PaymentRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('#findByIdAndUserIdOrFail', () => {
        beforeEach(() => {
            mockPaymentRepository.findById.mockResolvedValue(payment);
        });

        it('should find invitation by id and user successfully', async () => {
            const result = await service.findByIdOrFail(
                paymentId,
            );

            expect(mockPaymentRepository.findById).toHaveBeenCalledWith(
                paymentId,
            );

            expect(result).toEqual(payment);
        });

        it('should throw NotFoundException', async () => {
            mockPaymentRepository.findById.mockResolvedValue(null);

            await expect(service.findByIdOrFail(
                paymentId,
            )).rejects.toThrow(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );
        });
    });

    describe('#validateReferenceIsUnique', () => {
        it('should not throw when payment reference does not exist', async () => {
            mockPaymentRepository.findByReferenceNumber.mockResolvedValue(null);

            await expect(service.validateReferenceIsUnique(
                referenceNumber,
            )).resolves.toBeUndefined();

            expect(mockPaymentRepository.findByReferenceNumber).toHaveBeenCalledWith(
                referenceNumber,
            );
            mockPaymentRepository.findByReferenceNumber.mockResolvedValue(null);
        });

        it('should throw ConflictException when payment reference already exists', async () => {
            mockPaymentRepository.findByReferenceNumber.mockResolvedValue(payment);

            await expect(service.validateReferenceIsUnique(
                referenceNumber,
            )).rejects.toThrow(ConflictException);

            expect(mockPaymentRepository.findByReferenceNumber).toHaveBeenCalledWith(
                referenceNumber,
            );
        });
    });
});
