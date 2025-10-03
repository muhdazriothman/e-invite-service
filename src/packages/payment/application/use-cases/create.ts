import { JwtUser } from '@auth/interfaces/http/strategies/jwt';
import {
    Injectable,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { Payment } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';
import { paymentErrors } from '@shared/constants/error-codes';

@Injectable()
export class CreatePaymentUseCase {
    constructor (
        private readonly paymentRepository: PaymentRepository,
    ) { }

    async execute (
        user: JwtUser,
        createPaymentDto: CreatePaymentDto,
    ): Promise<Payment> {
        const {
            id: userId,
        } = user;

        const {
            amount,
            currency,
            paymentMethod,
            referenceNumber,
            description,
            planType,
        } = createPaymentDto;

        try {
            await this.validateReferenceIsUnique(referenceNumber);

            const payment = Payment.createNew({
                amount,
                currency,
                paymentMethod,
                referenceNumber,
                description,
                planType,
                createdBy: userId,
            });

            return await this.paymentRepository.create(payment);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
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
