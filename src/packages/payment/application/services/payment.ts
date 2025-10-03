import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { paymentErrors } from '@shared/constants/error-codes';

@Injectable()
export class PaymentService {
    constructor (
        private readonly paymentRepository: PaymentRepository,
    ) { }

    async findByIdOrFail (
        id: string,
    ): Promise<Payment> {
        const payment = await this.paymentRepository.findById(
            id,
        );
        if (!payment) {
            throw new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND);
        }

        return payment;
    }

    async validateReferenceIsUnique (
        referenceNumber: string,
    ): Promise<void> {
        const payment = await this.paymentRepository.findByReferenceNumber(referenceNumber);
        if (payment) {
            throw new ConflictException(paymentErrors.PAYMENT_REFERENCE_ALREADY_EXISTS);
        }
    }
}
