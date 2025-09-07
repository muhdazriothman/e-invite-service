import {
    Injectable,
    Inject,
    ConflictException,
} from '@nestjs/common';
import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';

@Injectable()
export class CreatePaymentUseCase {
    constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    ) {}

    async execute(
        createPaymentDto: CreatePaymentDto,
        createdBy: string,
    ): Promise<Payment> {
        const existingPayment = await this.paymentRepository.findByReference(
            createPaymentDto.reference,
        );
        if (existingPayment) {
            throw new ConflictException('Payment with this reference already exists');
        }

        const payment = Payment.createNew({
            currency: createPaymentDto.currency,
            paymentMethod: createPaymentDto.paymentMethod,
            reference: createPaymentDto.reference,
            description: createPaymentDto.description,
            planType: createPaymentDto.planType,
            createdBy,
        });

        return await this.paymentRepository.create(payment);
    }
}
