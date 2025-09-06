import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { PaymentRepository } from '@payment/infra/repository';

@Injectable()
export class DeletePaymentUseCase {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    await this.paymentRepository.delete(id);
  }
}
