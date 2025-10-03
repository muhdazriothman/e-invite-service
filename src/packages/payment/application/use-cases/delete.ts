import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PaymentService } from '@payment/application/services/payment';
import { PaymentRepository } from '@payment/infra/repository';

@Injectable()
export class DeletePaymentUseCase {
    constructor (
        private readonly paymentRepository: PaymentRepository,

        private readonly paymentService: PaymentService,
    ) { }

    async execute (
        id: string,
    ): Promise<void> {
        try {
            await this.paymentService.findByIdOrFail(id);

            await this.paymentRepository.deleteById(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}

