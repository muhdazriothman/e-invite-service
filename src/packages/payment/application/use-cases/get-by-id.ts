import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';

@Injectable()
export class GetPaymentByIdUseCase {
    constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    ) {}

    async execute(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findById(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
