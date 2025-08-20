export enum UserType {
    USER = 'user',
    ADMIN = 'admin',
}

export interface UserProps {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    type: UserType;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export class User {
    public id: string;
    public username: string;
    public email: string;
    public passwordHash: string;
    public type: UserType;
    public isDeleted: boolean;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor(user: UserProps) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.passwordHash = user.passwordHash;
        this.type = user.type;
        this.isDeleted = user.isDeleted ?? false;
        this.createdAt = user.createdAt ?? new Date();
        this.updatedAt = user.updatedAt ?? new Date();
        this.deletedAt = user.deletedAt ?? null;
    }
}
