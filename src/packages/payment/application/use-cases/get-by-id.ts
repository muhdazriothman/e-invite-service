import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PaymentService } from '@payment/application/services/payment';
import { Payment } from '@payment/domain/entities/payment';

@Injectable()
export class GetPaymentByIdUseCase {
    constructor (
        private readonly paymentService: PaymentService,
    ) { }

    async execute (id: string): Promise<Payment> {
        try {
            const payment = await this.paymentService.findByIdOrFail(id);

            return payment;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }

    }
}
