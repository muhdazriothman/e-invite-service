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
  reference: string;
  description?: string;
  planType: PlanType;
  usedAt: Date | null;
  createdBy: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreatePaymentProps {
  currency: string;
  paymentMethod: PaymentMethod;
  reference: string;
  description?: string;
  planType: PlanType;
  createdBy: string;
}

export class Payment {
    public readonly id: string;
    public amount: number;
    public currency: string;
    public paymentMethod: PaymentMethod;
    public status: PaymentStatus;
    public reference: string;
    public description?: string;
    public planType: PlanType;
    public usedAt: Date | null;
    public createdBy: string;
    public isDeleted: boolean;
    public readonly createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor(props: PaymentProps) {
        this.id = props.id;
        this.amount = props.amount;
        this.currency = props.currency;
        this.paymentMethod = props.paymentMethod;
        this.status = props.status;
        this.reference = props.reference;
        this.description = props.description;
        this.planType = props.planType;
        this.usedAt = props.usedAt;
        this.createdBy = props.createdBy;
        this.isDeleted = props.isDeleted;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
    }

    static createNew(props: CreatePaymentProps): Payment {
        const now = new Date();
        const amount = Payment.getAmount(props.planType);

        return new Payment({
            id: '', // Will be set by the database
            amount: amount,
            currency: props.currency,
            paymentMethod: props.paymentMethod,
            status: PaymentStatus.VERIFIED,
            reference: props.reference,
            description: props.description,
            planType: props.planType,
            usedAt: null,
            createdBy: props.createdBy,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        });
    }

    static createFromDb(props: PaymentProps): Payment {
        return new Payment(props);
    }

    static getAmount(planType: PlanType): number {
        const amount = PlanPricing[planType];
        if (!amount) {
            throw new Error(`Invalid plan type: ${planType}`);
        }

        return amount;
    }
}
