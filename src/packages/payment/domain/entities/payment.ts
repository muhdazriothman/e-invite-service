import { PaymentLean } from '@payment/infra/schema';

export enum PlanType {
    BASIC = 'basic',
    PREMIUM = 'premium',
}

export const PlanPricing = {
    [PlanType.BASIC]: 10.0,
    [PlanType.PREMIUM]: 25.0,
} as const;

export const PlanInvitationLimits = {
    [PlanType.BASIC]: 1,
    [PlanType.PREMIUM]: 3,
} as const;

export enum PaymentStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    USED = 'used',
    EXPIRED = 'expired',
    REFUNDED = 'refunded',
}

export enum PaymentMethod {
    BANK_TRANSFER = 'bank_transfer',
    CREDIT_CARD = 'credit_card',
    CASH = 'cash',
    OTHER = 'other',
}

export interface PaymentProps {
    id: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber: string;
    description: string | null;
    planType: PlanType;
    usedAt: Date | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt: Date | null;
}

export interface CreatePaymentProps {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    description: string | null;
    planType: PlanType;
    createdBy: string;
}

export interface UpdatePaymentProps {
    amount?: number;
    currency?: string;
    paymentMethod?: PaymentMethod;
    referenceNumber?: string;
    description?: string;
    status?: PaymentStatus;
    planType?: PlanType;
    usedAt?: Date;
}

export class Payment {
    public readonly id: string;
    public amount: number;
    public currency: string;
    public paymentMethod: PaymentMethod;
    public status: PaymentStatus;
    public referenceNumber: string;
    public description: string | null;
    public planType: PlanType;
    public usedAt: Date | null;
    public createdBy: string;
    public readonly createdAt: Date;
    public updatedAt: Date;
    public isDeleted: boolean;
    public deletedAt: Date | null;

    constructor (props: PaymentProps) {
        this.id = props.id;
        this.amount = props.amount;
        this.currency = props.currency;
        this.paymentMethod = props.paymentMethod;
        this.status = props.status;
        this.referenceNumber = props.referenceNumber;
        this.description = props.description;
        this.planType = props.planType;
        this.usedAt = props.usedAt;
        this.createdBy = props.createdBy;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.isDeleted = props.isDeleted;
        this.deletedAt = props.deletedAt;
    }

    static createNew (props: CreatePaymentProps): Payment {
        const now = new Date();
        const amount = Payment.getAmount(props.planType);

        return new Payment({
            id: '', // Will be set by the database
            amount: amount,
            currency: props.currency,
            paymentMethod: props.paymentMethod,
            status: PaymentStatus.VERIFIED,
            referenceNumber: props.referenceNumber,
            description: props.description,
            planType: props.planType,
            usedAt: null,
            createdBy: props.createdBy,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
        });
    }

    static createFromDb (props: PaymentLean): Payment {
        return new Payment({
            id: props._id.toString(),
            amount: props.amount,
            currency: props.currency,
            paymentMethod: props.paymentMethod,
            status: props.status,
            referenceNumber: props.referenceNumber,
            description: props.description,
            planType: props.planType,
            usedAt: props.usedAt,
            createdBy: props.createdBy,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            isDeleted: props.isDeleted,
            deletedAt: props.deletedAt,
        });
    }

    static getAmount (planType: PlanType): number {
        const amount = PlanPricing[planType];
        if (!amount) {
            throw new Error(`Invalid plan type: ${planType}`);
        }

        return amount;
    }
}
