export interface UserProps {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
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
    public isDeleted: boolean;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor(user: UserProps) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.passwordHash = user.passwordHash;
        this.isDeleted = user.isDeleted ?? false;
        this.createdAt = user.createdAt ?? new Date();
        this.updatedAt = user.updatedAt ?? new Date();
        this.deletedAt = user.deletedAt ?? null;
    }
}
