import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { PaymentService } from '@payment/application/services/payment';
import {
    Payment,
    PaymentStatus,
    UpdatePaymentProps,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';

import { paymentErrors } from '../../../shared/constants/error-codes';

@Injectable()
export class UpdatePaymentUseCase {
    constructor (
        private readonly paymentRepository: PaymentRepository,

        private readonly paymentService: PaymentService,
    ) { }

    async execute (
        id: string,
        updatePaymentDto: UpdatePaymentDto,
    ): Promise<Payment> {
        const {
            amount,
            currency,
            paymentMethod,
            referenceNumber,
            description,
            status,
            planType,
        } = updatePaymentDto;

        try {
            const updates: Partial<UpdatePaymentProps> = {};

            const existingPayment = await this.paymentService.findByIdOrFail(id);

            if (referenceNumber !== undefined &&
                referenceNumber !== existingPayment.referenceNumber
            ) {
                await this.paymentService.validateReferenceIsUnique(
                    referenceNumber,
                );

                updates.referenceNumber = referenceNumber;
            }

            if (updatePaymentDto.status !== undefined) {
                UpdatePaymentUseCase.validateStatusTransition(
                    existingPayment.status,
                    updatePaymentDto.status,
                );

                updates.status = status;

                if (updatePaymentDto.status === PaymentStatus.USED) {
                    updates.usedAt = new Date();
                }
            }

            if (amount !== undefined) {
                updates.amount = amount;
            }

            if (currency !== undefined) {
                updates.currency = currency;
            }

            if (paymentMethod !== undefined) {
                updates.paymentMethod = paymentMethod;
            }

            if (description !== undefined) {
                updates.description = description;
            }

            if (planType !== undefined) {
                updates.planType = planType;
            }

            const result = await this.paymentRepository.updateById(
                id,
                updates,
            );

            if (!result) {
                throw new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND);
            }

            return result;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }

    static validateStatusTransition (
        currentStatus: PaymentStatus,
        newStatus: PaymentStatus,
    ): void {
        const allowedTransitions = {
            [PaymentStatus.PENDING]: [
                PaymentStatus.PENDING,
                PaymentStatus.VERIFIED,
                PaymentStatus.EXPIRED,
                PaymentStatus.REFUNDED,
            ],
            [PaymentStatus.VERIFIED]: [
                PaymentStatus.VERIFIED,
                PaymentStatus.USED,
                PaymentStatus.EXPIRED,
                PaymentStatus.REFUNDED,
            ],
            [PaymentStatus.USED]: [
                PaymentStatus.USED,
                PaymentStatus.REFUNDED,
            ],
            [PaymentStatus.EXPIRED]: [
                PaymentStatus.EXPIRED,
                PaymentStatus.REFUNDED,
            ],
            [PaymentStatus.REFUNDED]: [
                PaymentStatus.REFUNDED,
            ],
        };

        if (!allowedTransitions[currentStatus].includes(newStatus)) {
            throw new BadRequestException(
                paymentErrors.INVALID_STATUS_TRANSITION,
            );
        }
    }
}
