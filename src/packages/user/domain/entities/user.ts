export enum UserType {
    USER = 'user',
    ADMIN = 'admin',
}

export interface UserProps {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    type: UserType;
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
}

export class User {
    public readonly id: string;
    public name: string;
    public readonly email: string;
    public passwordHash: string;
    public readonly type: UserType;
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
        this.isDeleted = props.isDeleted;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
    }

    static createNew(props: CreateUserProps): User {
        const now = new Date();

        return new User({
            id: '', // Will be set by the database
            name: props.name,
            email: props.email,
            passwordHash: props.passwordHash,
            type: props.type,
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
