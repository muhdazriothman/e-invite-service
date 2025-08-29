import { PlanConfig } from '@user/domain/value-objects/plan-config';

export enum UserType {
    USER = 'user',
    ADMIN = 'admin',
}

export enum PlanType {
    BASIC = 'basic',
    PREMIUM = 'premium',
}

export interface Plan {
    type: PlanType;
    invitationLimit: number;
    name: string;
    description?: string;
}

export interface UserProps {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    type: UserType;
    plan: PlanConfig;
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
    planType: PlanType;
}

export class User {
    public readonly id: string;
    public name: string;
    public readonly email: string;
    public passwordHash: string;
    public readonly type: UserType;
    public plan: PlanConfig;
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
        this.plan = props.plan;
        this.isDeleted = props.isDeleted;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
    }

    static createNew(props: CreateUserProps): User {
        const now = new Date();
        const planConfig = PlanConfig.create(props.planType);

        return new User({
            id: '', // Will be set by the database
            name: props.name,
            email: props.email,
            passwordHash: props.passwordHash,
            type: props.type,
            plan: planConfig,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        });
    }

    static createFromDb(props: UserProps): User {
        return new User(props);
    }
}
