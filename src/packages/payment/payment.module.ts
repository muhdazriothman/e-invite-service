import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import {
    MongooseModule,
    getModelToken,
} from '@nestjs/mongoose';
import { PaymentService } from '@payment/application/services/payment';
import { CreatePaymentUseCase } from '@payment/application/use-cases/create';
import { DeletePaymentUseCase } from '@payment/application/use-cases/delete';
import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import { UpdatePaymentUseCase } from '@payment/application/use-cases/update';
import { PaymentRepository } from '@payment/infra/repository';
import {
    PaymentHydrated,
    PaymentMongoModelName,
    PaymentMongoSchema,
} from '@payment/infra/schema';
import { PaymentController } from '@payment/interfaces/http/controller';
import { Model } from 'mongoose';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            {
                name: PaymentMongoModelName,
                schema: PaymentMongoSchema,
            },
        ]),
    ],
    controllers: [PaymentController],
    providers: [
        {
            provide: PaymentRepository,
            useFactory: (paymentModel: Model<PaymentHydrated>) => new PaymentRepository(paymentModel),
            inject: [getModelToken(PaymentMongoModelName)],
        },
        PaymentService,
        CreatePaymentUseCase,
        ListPaymentsUseCase,
        GetPaymentByIdUseCase,
        UpdatePaymentUseCase,
        DeletePaymentUseCase,
    ],
    exports: [PaymentRepository],
})
export class PaymentModule {}
