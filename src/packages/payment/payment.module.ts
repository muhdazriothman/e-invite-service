import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AuthModule } from '@auth/auth.module';
import { PaymentController } from '@payment/interfaces/http/controller';
import { CreatePaymentUseCase } from '@payment/application/use-cases/create';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';
import { UpdatePaymentUseCase } from '@payment/application/use-cases/update';
import { DeletePaymentUseCase } from '@payment/application/use-cases/delete';
import {
    PaymentMongoModelName,
    PaymentMongoSchema,
} from '@payment/infra/schema';
import { PaymentRepository } from '@payment/infra/repository';

const createPaymentRepository = (paymentModel: any) =>
    new PaymentRepository(paymentModel);

const createMockPaymentRepository = () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByReference: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

@Module({
    imports: [
        AuthModule,
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forFeature([
                    { name: PaymentMongoModelName, schema: PaymentMongoSchema },
                ]),
            ]),
    ],
    controllers: [PaymentController],
    providers: [
        CreatePaymentUseCase,
        ListPaymentsUseCase,
        GetPaymentByIdUseCase,
        UpdatePaymentUseCase,
        DeletePaymentUseCase,
        {
            provide: 'PaymentRepository',
            useFactory:
                process.env.NODE_ENV === 'test'
                    ? createMockPaymentRepository
                    : createPaymentRepository,
            inject:
                process.env.NODE_ENV === 'test'
                    ? []
                    : [getModelToken(PaymentMongoModelName)],
        },
    ],
    exports: [
        'PaymentRepository',
    ],
})
export class PaymentModule { }
