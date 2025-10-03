import {
    Payment,
    PaymentMethod,
    PaymentStatus,
    PlanType,
} from '@payment/domain/entities/payment';
import { PaymentLean } from '@payment/infra/schema';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';

export class PaymentFixture {
    static getProps (
        props: Partial<Payment> = {},
    ) {
        const {
            id = '000000000000000000000001',
            amount = 10.0,
            currency = 'USD',
            paymentMethod = PaymentMethod.CASH,
            status = PaymentStatus.VERIFIED,
            referenceNumber = 'REF-123456',
            description = 'Test payment',
            planType = PlanType.BASIC,
            usedAt = null,
            createdBy = 'admin-id-123',
            isDeleted = false,
            createdAt = new Date(),
            updatedAt = new Date(),
            deletedAt = null,
        } = props;

        return {
            id,
            amount,
            currency,
            paymentMethod,
            status,
            referenceNumber,
            description,
            planType,
            usedAt,
            createdBy,
            isDeleted,
            createdAt,
            updatedAt,
            deletedAt,
        };
    }

    static getEntity (
        params: Partial<Payment> = {},
    ): Payment {
        const props = PaymentFixture.getProps(params);
        return new Payment(props);
    }

    static getLean (
        params: Partial<Payment> = {},
    ): PaymentLean {
        const props = PaymentFixture.getProps(params);

        return {
            _id: new Types.ObjectId(props.id),
            amount: props.amount,
            currency: props.currency,
            paymentMethod: props.paymentMethod,
            status: props.status,
            referenceNumber: props.referenceNumber,
            description: props.description,
            planType: props.planType,
            usedAt: props.usedAt,
            createdBy: props.createdBy,
            isDeleted: props.isDeleted,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            deletedAt: props.deletedAt,
        };
    }

    static getCreateDto (
        params: Partial<CreatePaymentDto> = {},
    ): CreatePaymentDto {
        const {
            amount = 10.0,
            currency = 'USD',
            paymentMethod = PaymentMethod.CASH,
            referenceNumber = 'REF-123456',
            description = 'Test payment',
            planType = PlanType.BASIC,
        } = params;

        const plainData = {
            amount,
            currency,
            paymentMethod,
            referenceNumber,
            description,
            planType,
        };

        return plainToClass(CreatePaymentDto, plainData);
    }

    static getUpdateDto (
        params: Partial<UpdatePaymentDto> = {},
    ): UpdatePaymentDto {
        const {
            amount = 10.0,
            currency = 'USD',
            paymentMethod = PaymentMethod.CASH,
            referenceNumber = 'REF-123456',
            description = 'Test payment',
            planType = PlanType.BASIC,
        } = params;

        const plainData = {
            amount,
            currency,
            paymentMethod,
            referenceNumber,
            description,
            planType,
        };

        return plainToClass(UpdatePaymentDto, plainData);
    }
}
