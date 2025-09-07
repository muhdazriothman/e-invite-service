import {
    Injectable,
    Inject,
} from '@nestjs/common';
import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';

@Injectable()
export class ListPaymentsUseCase {
    constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    ) {}

    async execute(): Promise<Payment[]> {
        return await this.paymentRepository.findAll();
    }
}
