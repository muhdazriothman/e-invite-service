import {
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import {
    IsNumber,
    IsString,
    IsEnum,
    IsOptional,
    Min,
    Length,
} from 'class-validator';

export class UpdatePaymentDto {
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    amount?: number;

    @IsOptional()
    @IsString()
    @Length(3, 3)
    currency?: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    referenceNumber?: string;

    @IsOptional()
    @IsString()
    @Length(1, 500)
    description?: string;

    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @IsOptional()
    @IsEnum(PlanType)
    planType?: PlanType;
}
