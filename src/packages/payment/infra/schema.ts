import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';
import {
    PaymentStatus,
    PaymentMethod,
    PlanType,
} from '@payment/domain/entities/payment';
import {
    HydratedDocument,
    Types,
} from 'mongoose';

export interface PaymentLean {
    _id: Types.ObjectId;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber: string;
    description: string | null;
    planType: PlanType;
    usedAt: Date | null;
    createdBy: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export type PaymentHydrated = HydratedDocument<PaymentMongoDocument>;

@Schema({ versionKey: false })
export class PaymentMongoDocument {
    @Prop({
        required: true,
        type: Number,
    })
    amount: number;

    @Prop({
        required: true,
        type: String,
    })
    currency: string;

    @Prop({
        required: true,
        type: String,
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod;

    @Prop({
        required: true,
        type: String,
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Prop({
        required: true,
        type: String,
        unique: true,
    })
    referenceNumber: string;

    @Prop({
        type: String,
    })
    description: string | null;

    @Prop({
        required: true,
        type: String,
        enum: PlanType,
    })
    planType: PlanType;

    @Prop({
        type: Date,
        default: null,
    })
    usedAt: Date | null;

    @Prop({
        required: true,
        type: String,
    })
    createdBy: string;

    @Prop({
        required: true,
        type: Boolean,
        default: false,
    })
    isDeleted: boolean;

    @Prop({
        required: true,
        type: Date,
    })
    createdAt: Date;

    @Prop({
        required: true,
        type: Date,
    })
    updatedAt: Date;

    @Prop({
        type: Date,
        default: null,
    })
    deletedAt: Date | null;
}

export const PaymentMongoSchema = SchemaFactory.createForClass(
    PaymentMongoDocument,
);

export const PaymentMongoModelName = 'Payment';

