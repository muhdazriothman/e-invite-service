import {
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Min,
} from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    @Length(3, 3)
    currency: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsString()
    @Length(1, 100)
    referenceNumber: string;

    @IsOptional()
    @IsString()
    @Length(1, 500)
    description: string | null;

    @IsEnum(PlanType)
    planType: PlanType;
}
