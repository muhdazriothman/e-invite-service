import {
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { CreatePaymentUseCase } from '@payment/application/use-cases/create';
import {
    Payment,
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';
import { paymentErrors } from '@shared/constants/error-codes';
import { PaymentFixture } from '@test/fixture/payment';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@payment/application/use-cases/create', () => {
    const userId = '000000000000000000000001';
    const paymentId = '000000000000000000000002';
    const referenceNumber = 'PAY-001';

    let useCase: CreatePaymentUseCase;
    let mockPaymentRepository: jest.Mocked<PaymentRepository>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    const createPaymentDto: CreatePaymentDto = {
        amount: 100,
        currency: 'USD',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        referenceNumber: 'PAY-001',
        description: 'Test payment',
        planType: PlanType.BASIC,
    };

    const payment = PaymentFixture.getEntity({
        id: paymentId,
        referenceNumber,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreatePaymentUseCase,
                {
                    provide: PaymentRepository,
                    useValue: createMock<PaymentRepository>(),
                },
            ],
        }).compile();

        useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
        mockPaymentRepository = module.get(PaymentRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('#execute', () => {
        let mockValidateReferenceIsUnique: jest.SpyInstance;
        let spyPaymentCreateNew: jest.SpyInstance;

        beforeEach(() => {
            mockValidateReferenceIsUnique = jest.spyOn(
                useCase,
                'validateReferenceIsUnique',
            ).mockResolvedValue();

            spyPaymentCreateNew = jest.spyOn(
                Payment,
                'createNew',
            );

            mockPaymentRepository.findByReferenceNumber.mockResolvedValue(null);
            mockPaymentRepository.create.mockResolvedValue(payment);
        });

        it('should create payment successfully', async () => {
            const result = await useCase.execute(
                user,
                createPaymentDto,
            );

            expect(mockValidateReferenceIsUnique).toHaveBeenCalledWith(
                createPaymentDto.referenceNumber,
            );

            expect(spyPaymentCreateNew).toHaveBeenCalledWith({
                amount: createPaymentDto.amount,
                currency: createPaymentDto.currency,
                paymentMethod: createPaymentDto.paymentMethod,
                referenceNumber: createPaymentDto.referenceNumber,
                description: createPaymentDto.description,
                planType: createPaymentDto.planType,
                createdBy: userId,
            });

            const paymentCreateNewResult = spyPaymentCreateNew.mock.results[0].value;

            expect(mockPaymentRepository.create).toHaveBeenCalledWith(
                paymentCreateNewResult,
            );

            expect(result).toEqual(payment);
        });

        it('should handle ConflictException', async () => {
            mockValidateReferenceIsUnique.mockImplementation(
                () => {
                    throw new ConflictException(
                        paymentErrors.PAYMENT_REFERENCE_ALREADY_EXISTS,
                    );
                },
            );

            await expect(useCase.execute(
                user,
                createPaymentDto,
            )).rejects.toThrow(
                new ConflictException(
                    paymentErrors.PAYMENT_REFERENCE_ALREADY_EXISTS,
                ),
            );
        });

        it('should handle unexpected error', async () => {
            mockPaymentRepository.create.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(
                user,
                createPaymentDto,
            )).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });
});
