import { RequestWithUser } from '@invitation/interfaces/http/middleware/user-context.middleware';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { CreatePaymentUseCase } from '@payment/application/use-cases/create';
import { DeletePaymentUseCase } from '@payment/application/use-cases/delete';
import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import { UpdatePaymentUseCase } from '@payment/application/use-cases/update';
import { PaymentController } from '@payment/interfaces/http/controller';
import { PaymentMapper } from '@payment/interfaces/http/mapper';
import { PaymentFixture } from '@test/fixture/payment';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@payment/interfaces/http/controller', () => {
    const userId = '000000000000000000000001';
    const paymentId = '000000000000000000000002';

    let controller: PaymentController;
    let createPaymentUseCase: jest.Mocked<CreatePaymentUseCase>;
    let listPaymentsUseCase: jest.Mocked<ListPaymentsUseCase>;
    let getPaymentByIdUseCase: jest.Mocked<GetPaymentByIdUseCase>;
    let updatePaymentUseCase: jest.Mocked<UpdatePaymentUseCase>;
    let deletePaymentUseCase: jest.Mocked<DeletePaymentUseCase>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    const payment = PaymentFixture.getEntity({
        id: paymentId,
    });

    const mockRequest: RequestWithUser = {
        user: { id: userId },
        userData: user,
    } as RequestWithUser;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: CreatePaymentUseCase,
                    useValue: createMock<CreatePaymentUseCase>(),
                },
                {
                    provide: ListPaymentsUseCase,
                    useValue: createMock<ListPaymentsUseCase>(),
                },
                {
                    provide: GetPaymentByIdUseCase,
                    useValue: createMock<GetPaymentByIdUseCase>(),
                },
                {
                    provide: UpdatePaymentUseCase,
                    useValue: createMock<UpdatePaymentUseCase>(),
                },
                {
                    provide: DeletePaymentUseCase,
                    useValue: createMock<DeletePaymentUseCase>(),
                },
            ],
        }).compile();

        controller = module.get<PaymentController>(PaymentController);
        createPaymentUseCase = module.get(CreatePaymentUseCase);
        listPaymentsUseCase = module.get(ListPaymentsUseCase);
        getPaymentByIdUseCase = module.get(GetPaymentByIdUseCase);
        updatePaymentUseCase = module.get(UpdatePaymentUseCase);
        deletePaymentUseCase = module.get(DeletePaymentUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('#createPayment', () => {
        const createDto = PaymentFixture.getCreateDto();

        it('should create a new payment', async () => {
            createPaymentUseCase.execute.mockResolvedValue(payment);

            const result = await controller.createPayment(
                createDto,
                mockRequest,
            );

            expect(createPaymentUseCase.execute).toHaveBeenCalledWith(
                user,
                createDto,
            );

            expect(result).toEqual({
                message: 'Payment created successfully',
                data: PaymentMapper.toDto(payment),
            });
        });

        it('should throw an error if the payment creation fails', async () => {
            createPaymentUseCase.execute.mockRejectedValue(
                new Error('Payment creation failed'),
            );

            await expect(
                controller.createPayment(createDto, mockRequest),
            ).rejects.toThrow('Payment creation failed');
        });
    });

    describe('#listPayments', () => {
        it('should return list of payments', async () => {
            const payments = [
                PaymentFixture.getEntity({
                    id: '000000000000000000000001',
                }),
                PaymentFixture.getEntity({
                    id: '000000000000000000000002',
                }),
            ];

            listPaymentsUseCase.execute.mockResolvedValue(payments);

            const result = await controller.listPayments();

            expect(listPaymentsUseCase.execute).toHaveBeenCalledWith();

            expect(result).toEqual({
                message: 'Payments retrieved successfully',
                data: payments.map((payment) => PaymentMapper.toDto(payment)),
            });
        });

        it('should throw an error if the payment listing fails', async () => {
            listPaymentsUseCase.execute.mockRejectedValue(
                new Error('Payment listing failed'),
            );

            await expect(
                controller.listPayments(),
            ).rejects.toThrow('Payment listing failed');
        });
    });

    describe('#getPaymentById', () => {
        it('should return payment by id', async () => {
            getPaymentByIdUseCase.execute.mockResolvedValue(payment);

            const result = await controller.getPaymentById(paymentId);

            expect(getPaymentByIdUseCase.execute).toHaveBeenCalledWith(
                paymentId,
            );

            expect(result).toEqual({
                message: 'Payment retrieved successfully',
                data: PaymentMapper.toDto(payment),
            });
        });

        it('should throw an error if the payment is not found', async () => {
            getPaymentByIdUseCase.execute.mockRejectedValue(
                new Error('Payment not found'),
            );

            await expect(
                controller.getPaymentById('non-existent-id'),
            ).rejects.toThrow('Payment not found');
        });
    });

    describe('#updatePayment', () => {
        const updateDto = PaymentFixture.getUpdateDto();

        it('should update payment successfully', async () => {
            updatePaymentUseCase.execute.mockResolvedValue(payment);

            const result = await controller.updatePayment(
                paymentId,
                updateDto,
            );

            expect(updatePaymentUseCase.execute).toHaveBeenCalledWith(
                paymentId,
                updateDto,
            );

            expect(result).toEqual({
                message: 'Payment updated successfully',
                data: PaymentMapper.toDto(payment),
            });
        });

        it('should throw an error if the payment is not found', async () => {
            updatePaymentUseCase.execute.mockRejectedValue(
                new Error('Payment not found'),
            );

            await expect(
                controller.updatePayment('non-existent-id', updateDto),
            ).rejects.toThrow('Payment not found');
        });
    });

    describe('#deletePayment', () => {
        it('should delete payment successfully', async () => {
            deletePaymentUseCase.execute.mockResolvedValue(undefined);

            const result = await controller.deletePayment(paymentId);

            expect(deletePaymentUseCase.execute).toHaveBeenCalledWith(
                paymentId,
            );

            expect(result).toEqual({
                message: 'Payment deleted successfully',
            });
        });

        it('should throw an error if the payment is not found', async () => {
            deletePaymentUseCase.execute.mockRejectedValue(
                new Error('Payment not found'),
            );

            await expect(
                controller.deletePayment('non-existent-id'),
            ).rejects.toThrow('Payment not found');
        });
    });
});
