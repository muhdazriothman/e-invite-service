import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';

@Injectable()
export class ListPaymentsUseCase {
    constructor (
        private readonly paymentRepository: PaymentRepository,
    ) { }

    async execute (): Promise<Payment[]> {
        try {
            return await this.paymentRepository.findAll();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
