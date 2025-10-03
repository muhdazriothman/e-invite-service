import {
    PlanInvitationLimits,
    PlanType,
} from '@payment/domain/entities/payment';
import { UserLean } from '@user/infra/schema';

export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserCapabilities {
  invitationLimit: number;
}

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  type: UserType;
  capabilities: UserCapabilities | null;
  paymentId: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserProps {
  name: string;
  email: string;
  passwordHash: string;
  type: UserType;
  paymentId: string | null;
}

export interface CreateAdminProps {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UpdateUserProps {
    name?: string;
    passwordHash?: string;
}

export class User {
    public readonly id: string;
    public name: string;
    public readonly email: string;
    public passwordHash: string;
    public readonly type: UserType;
    public capabilities: UserCapabilities | null;
    public paymentId: string | null;
    public isDeleted: boolean;
    public readonly createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor (props: UserProps) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.passwordHash = props.passwordHash;
        this.type = props.type;
        this.capabilities = props.capabilities;
        this.paymentId = props.paymentId;
        this.isDeleted = props.isDeleted;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
    }

    static createNewUser (
        props: CreateUserProps,
        planType: PlanType,
    ): User {
        const now = new Date();
        const invitationLimit = User.getInvitationLimitFromPlanType(planType);

        return new User({
            id: '', // Will be set by the database
            name: props.name,
            email: props.email,
            passwordHash: props.passwordHash,
            type: props.type,
            capabilities: {
                invitationLimit,
            },
            paymentId: props.paymentId,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        });
    }

    static createNewAdmin (props: CreateUserProps): User {
        const now = new Date();

        return new User({
            id: '', // Will be set by the database
            name: props.name,
            email: props.email,
            passwordHash: props.passwordHash,
            type: UserType.ADMIN,
            capabilities: null,
            paymentId: null,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        });
    }

    static createFromDb (props: UserLean): User {
        return new User({
            id: props._id.toString(),
            name: props.name,
            email: props.email,
            passwordHash: props.passwordHash,
            type: props.type,
            capabilities: props.capabilities,
            paymentId: props.paymentId?.toString() ?? null,
            isDeleted: props.isDeleted,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            deletedAt: props.deletedAt,
        });
    }

    static getInvitationLimitFromPlanType (planType: PlanType): number {
        const invitationLimit = PlanInvitationLimits[planType];
        if (invitationLimit === undefined) {
            throw new Error(`Invalid plan type: ${planType}`);
        }

        return invitationLimit;
    }
}
