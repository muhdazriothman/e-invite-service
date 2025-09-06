import {
  PaymentMethod,
  PlanType,
} from '@payment/domain/entities/payment';
import {
  IsString,
  IsEnum,
  IsOptional,
  Length,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @Length(3, 3)
    currency: string;

  @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

  @IsString()
  @Length(1, 100)
    reference: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
    description?: string;

  @IsEnum(PlanType)
    planType: PlanType;
}
