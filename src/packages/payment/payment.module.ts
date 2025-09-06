import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import {
  MongooseModule,
  getModelToken,
} from '@nestjs/mongoose';
import { CreatePaymentUseCase } from '@payment/application/use-cases/create';
import { DeletePaymentUseCase } from '@payment/application/use-cases/delete';
import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import { UpdatePaymentUseCase } from '@payment/application/use-cases/update';
import { PaymentRepository } from '@payment/infra/repository';
import {
  PaymentMongoModelName,
  PaymentMongoSchema,
} from '@payment/infra/schema';
import { PaymentController } from '@payment/interfaces/http/controller';

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
  exports: ['PaymentRepository'],
})
export class PaymentModule {}
