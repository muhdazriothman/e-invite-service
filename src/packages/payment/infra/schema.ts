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
import { Document } from 'mongoose';

export const PaymentMongoModelName = 'Payment';

export interface PaymentDocumentSchema {
  _id: unknown;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  description?: string;
  planType: PlanType;
  usedAt?: Date | null;
  createdBy: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

@Schema({
    timestamps: true,
    collection: 'payments',
})
export class PaymentMongoDocument extends Document {
  @Prop({ required: true, type: Number })
      amount: number;

  @Prop({ required: true, type: String })
      currency: string;

  @Prop({ required: true, enum: PaymentMethod })
      paymentMethod: PaymentMethod;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
      status: PaymentStatus;

  @Prop({ required: true, type: String, unique: true })
      reference: string;

  @Prop({ type: String })
      description?: string;

  @Prop({ required: true, enum: PlanType })
      planType: PlanType;

  @Prop({ type: Date, default: null })
      usedAt?: Date | null;

  @Prop({ required: true, type: String })
      createdBy: string;

  @Prop({ required: true, type: Boolean, default: false })
      isDeleted: boolean;

  @Prop({ required: true, type: Date })
      createdAt: Date;

  @Prop({ required: true, type: Date })
      updatedAt: Date;

  @Prop({ type: Date, default: null })
      deletedAt?: Date | null;
}

export const PaymentMongoSchema =
  SchemaFactory.createForClass(PaymentMongoDocument);
