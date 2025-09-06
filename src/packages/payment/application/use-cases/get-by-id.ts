import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { PaymentRepository } from '@payment/infra/repository';
import { Payment } from '@payment/domain/entities/payment';

@Injectable()
export class GetPaymentByIdUseCase {
    constructor(
        @Inject('PaymentRepository')
        private readonly paymentRepository: PaymentRepository,
    ) { }

    async execute(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findById(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
