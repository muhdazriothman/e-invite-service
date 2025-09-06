import {
  PlanInvitationLimits,
  PlanType,
} from '@payment/domain/entities/payment';

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
  capabilities: UserCapabilities;
  paymentId: string;
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
  paymentId: string;
}

export class User {
  public readonly id: string;
  public name: string;
  public readonly email: string;
  public passwordHash: string;
  public readonly type: UserType;
  public capabilities: UserCapabilities;
  public readonly paymentId: string;
  public isDeleted: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  constructor(props: UserProps) {
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

  static createNew(props: CreateUserProps, planType: PlanType): User {
    const now = new Date();
    const invitationLimit = User.getInvitationLimitFromPlanType(planType);

    return new User({
      id: '', // Will be set by the database
      name: props.name,
      email: props.email,
      passwordHash: props.passwordHash,
      type: props.type,
      capabilities: {
        invitationLimit: invitationLimit,
      },
      paymentId: props.paymentId,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static createFromDb(props: UserProps): User {
    return new User(props);
  }

  static getInvitationLimitFromPlanType(planType: PlanType): number {
    const invitationLimit = PlanInvitationLimits[planType];
    if (invitationLimit === undefined) {
      throw new Error(`Invalid plan type: ${planType}`);
    }

    return invitationLimit;
  }
}
