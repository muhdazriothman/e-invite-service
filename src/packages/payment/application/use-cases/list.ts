import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '@payment/infra/repository';
import { Payment } from '@payment/domain/entities/payment';

@Injectable()
export class ListPaymentsUseCase {
    constructor(
        @Inject('PaymentRepository')
        private readonly paymentRepository: PaymentRepository,
    ) { }

    async execute(): Promise<Payment[]> {
        return await this.paymentRepository.findAll();
    }
}
