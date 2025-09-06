import { ApiProperty } from '@nestjs/swagger';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PlanType,
} from '@payment/domain/entities/payment';

export class PaymentDto {
  @ApiProperty()
    id: string;

  @ApiProperty()
    amount: number;

  @ApiProperty()
    currency: string;

  @ApiProperty({ enum: PaymentMethod })
    paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
    status: PaymentStatus;

  @ApiProperty()
    reference: string;

  @ApiProperty({ required: false })
    description?: string;

  @ApiProperty({ enum: PlanType })
    planType: PlanType;

  @ApiProperty({ required: false })
    usedAt: Date | null;

  @ApiProperty()
    createdBy: string;

  @ApiProperty()
    createdAt: Date;

  @ApiProperty()
    updatedAt: Date;
}

export class PaymentResponseDto {
  @ApiProperty()
    message: string;

  @ApiProperty({ type: PaymentDto })
    data: PaymentDto;
}

export class PaymentListResponseDto {
  @ApiProperty()
    message: string;

  @ApiProperty({ type: [PaymentDto] })
    data: PaymentDto[];
}

export class PaymentMapper {
  static toDto(payment: Payment): PaymentDto {
    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      reference: payment.reference,
      description: payment.description,
      planType: payment.planType,
      usedAt: payment.usedAt,
      createdBy: payment.createdBy,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
