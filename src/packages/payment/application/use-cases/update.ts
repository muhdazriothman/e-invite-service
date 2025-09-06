import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Payment,
  PaymentStatus,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if new reference already exists
    if (updatePaymentDto.reference !== undefined) {
      const paymentWithSameReference =
        await this.paymentRepository.findByReference(
          updatePaymentDto.reference,
        );
      if (paymentWithSameReference && paymentWithSameReference.id !== id) {
        throw new BadRequestException(
          'Payment with this reference already exists',
        );
      }
    }

    // Handle status changes and prepare updates
    const updates: Partial<Pick<Payment, 'status' | 'usedAt'>> = {};

    if (updatePaymentDto.status !== undefined) {
      UpdatePaymentUseCase.validateStatusTransition(
        existingPayment.status,
        updatePaymentDto.status,
      );
      updates.status = updatePaymentDto.status;

      if (updatePaymentDto.status === PaymentStatus.USED) {
        updates.usedAt = new Date();
      }
    }

    const updatedPayment = await this.paymentRepository.update(id, updates);
    if (!updatedPayment) {
      throw new NotFoundException('Payment not found');
    }
    return updatedPayment;
  }

  static validateStatusTransition(
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus,
  ): void {
    switch (newStatus) {
    case PaymentStatus.VERIFIED:
      if (currentStatus !== PaymentStatus.PENDING) {
        throw new BadRequestException(
          'Only pending payments can be verified',
        );
      }
      break;
    case PaymentStatus.USED:
      if (currentStatus !== PaymentStatus.VERIFIED) {
        throw new BadRequestException(
          'Only verified payments can be marked as used',
        );
      }
      break;
    case PaymentStatus.EXPIRED:
      if (
        currentStatus !== PaymentStatus.PENDING &&
          currentStatus !== PaymentStatus.VERIFIED
      ) {
        throw new BadRequestException(
          'Only pending or verified payments can be marked as expired',
        );
      }
      break;
    case PaymentStatus.REFUNDED:
      if (currentStatus === PaymentStatus.REFUNDED) {
        throw new BadRequestException('Payment is already refunded');
      }
      break;
    case PaymentStatus.PENDING:
      // Reset to pending (admin override) - allowed from any status
      break;
    default:
      throw new BadRequestException(
        `Invalid status transition to ${newStatus}`,
      );
    }
  }
}
