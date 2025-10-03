import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaymentService } from '@payment/application/services/payment';
import { UpdatePaymentUseCase } from '@payment/application/use-cases/update';
import {
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';
import {
    invitationErrors,
    paymentErrors,
} from '@shared/constants/error-codes';
import { PaymentFixture } from '@test/fixture/payment';
import { createMock } from '@test/utils/mocks';

describe('@payment/application/use-cases/update', () => {
    const paymentId = '000000000000000000000001';

    let useCase: UpdatePaymentUseCase;
    let mockPaymentRepository: jest.Mocked<PaymentRepository>;
    let mockPaymentService: jest.Mocked<PaymentService>;

    const payment = PaymentFixture.getEntity({
        id: paymentId,
    });

    const updatePaymentDto: UpdatePaymentDto = {
        amount: 100,
        currency: 'MYR',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        referenceNumber: 'PAY-001',
        description: 'Test payment',
        planType: PlanType.PREMIUM,
        status: PaymentStatus.USED,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdatePaymentUseCase,
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

        useCase = module.get<UpdatePaymentUseCase>(UpdatePaymentUseCase);
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
        let mockValidateStatusTransition: jest.SpyInstance;

        beforeEach(() => {
            mockValidateStatusTransition = jest.spyOn(
                UpdatePaymentUseCase,
                'validateStatusTransition',
            );

            mockPaymentService.findByIdOrFail.mockResolvedValue(payment);
            mockPaymentRepository.updateById.mockResolvedValue(payment);
        });

        it('should update payment status successfully', async () => {
            const result = await useCase.execute(
                paymentId,
                updatePaymentDto,
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(paymentId);
            expect(mockPaymentService.validateReferenceIsUnique).toHaveBeenCalledWith(
                updatePaymentDto.referenceNumber,
            );

            expect(mockValidateStatusTransition).toHaveBeenCalledWith(
                payment.status,
                updatePaymentDto.status,
            );

            expect(mockPaymentRepository.updateById).toHaveBeenCalledWith(
                paymentId,
                expect.objectContaining({
                    amount: updatePaymentDto.amount,
                    currency: updatePaymentDto.currency,
                    paymentMethod: updatePaymentDto.paymentMethod,
                    referenceNumber: updatePaymentDto.referenceNumber,
                    description: updatePaymentDto.description,
                    planType: updatePaymentDto.planType,
                    status: updatePaymentDto.status,
                }),
            );

            expect(result).toEqual(payment);
        });

        it('should handle NotFoundException', async () => {
            mockPaymentService.findByIdOrFail.mockRejectedValue(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );

            await expect(useCase.execute(
                paymentId,
                updatePaymentDto,
            )).rejects.toThrow(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(
                paymentId,
            );

            expect(mockPaymentService.validateReferenceIsUnique).not.toHaveBeenCalled();
            expect(mockValidateStatusTransition).not.toHaveBeenCalled();
            expect(mockPaymentRepository.updateById).not.toHaveBeenCalled();
        });

        it('should handle ConflictException', async () => {
            mockPaymentService.validateReferenceIsUnique.mockImplementation(() => {
                throw new ConflictException(paymentErrors.PAYMENT_REFERENCE_ALREADY_EXISTS);
            });

            await expect(useCase.execute(
                paymentId,
                updatePaymentDto,
            )).rejects.toThrow(
                new ConflictException(paymentErrors.PAYMENT_REFERENCE_ALREADY_EXISTS),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(
                paymentId,
            );

            expect(mockPaymentService.validateReferenceIsUnique).toHaveBeenCalledWith(
                updatePaymentDto.referenceNumber,
            );

            expect(mockValidateStatusTransition).not.toHaveBeenCalled();
            expect(mockPaymentRepository.updateById).not.toHaveBeenCalled();
        });

        it('should handle BadRequestException', async () => {
            mockValidateStatusTransition.mockImplementation(() => {
                throw new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST);
            });

            await expect(useCase.execute(
                paymentId,
                updatePaymentDto,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(
                paymentId,
            );

            expect(mockPaymentService.validateReferenceIsUnique).toHaveBeenCalledWith(
                updatePaymentDto.referenceNumber,
            );

            expect(mockValidateStatusTransition).toHaveBeenCalledWith(
                payment.status,
                updatePaymentDto.status,
            );

            expect(mockPaymentRepository.updateById).not.toHaveBeenCalled();
        });

        it('should throw unexpected error', async () => {
            mockPaymentService.findByIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(
                paymentId,
                updatePaymentDto,
            )).rejects.toThrow(
                new InternalServerErrorException(new Error('Unexpected error')),
            );

            expect(mockPaymentService.findByIdOrFail).toHaveBeenCalledWith(
                paymentId,
            );

            expect(mockPaymentService.validateReferenceIsUnique).not.toHaveBeenCalled();
            expect(mockValidateStatusTransition).not.toHaveBeenCalled();
            expect(mockPaymentRepository.updateById).not.toHaveBeenCalled();
        });
    });

    describe('#validateStatusTransition', () => {
        const validTransitions = [
            [PaymentStatus.PENDING, PaymentStatus.PENDING],
            [PaymentStatus.PENDING, PaymentStatus.VERIFIED],
            [PaymentStatus.PENDING, PaymentStatus.EXPIRED],
            [PaymentStatus.PENDING, PaymentStatus.REFUNDED],
            [PaymentStatus.VERIFIED, PaymentStatus.VERIFIED],
            [PaymentStatus.VERIFIED, PaymentStatus.USED],
            [PaymentStatus.VERIFIED, PaymentStatus.EXPIRED],
            [PaymentStatus.VERIFIED, PaymentStatus.REFUNDED],
            [PaymentStatus.USED, PaymentStatus.USED],
            [PaymentStatus.USED, PaymentStatus.REFUNDED],
            [PaymentStatus.EXPIRED, PaymentStatus.EXPIRED],
            [PaymentStatus.EXPIRED, PaymentStatus.REFUNDED],
            [PaymentStatus.REFUNDED, PaymentStatus.REFUNDED],
        ];

        validTransitions.forEach(([currentStatus, newStatus]) => {
            it(`should allow transition from ${currentStatus} to ${newStatus}`, () => {
                expect(() => UpdatePaymentUseCase.validateStatusTransition(
                    currentStatus,
                    newStatus,
                )).not.toThrow(BadRequestException);
            });
        });

        const invalidTransitions = [
            [PaymentStatus.PENDING, PaymentStatus.USED],
            [PaymentStatus.USED, PaymentStatus.VERIFIED],
            [PaymentStatus.EXPIRED, PaymentStatus.VERIFIED],
            [PaymentStatus.REFUNDED, PaymentStatus.PENDING],
        ];

        invalidTransitions.forEach(([currentStatus, newStatus]) => {
            it(`should throw BadRequestException when trying to transition from ${currentStatus} to ${newStatus}`, () => {
                expect(() => UpdatePaymentUseCase.validateStatusTransition(
                    currentStatus,
                    newStatus,
                )).toThrow(BadRequestException);
            });
        });
    });
});
