export interface UserProps {
    id?: string;
    name: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
}

export class User {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;

    constructor (props: User) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.password = props.password;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.deleted = props.deleted;
        this.deletedAt = props.deletedAt;
    }

    static create (props: UserProps): User {
        return new User({
            id: props.id ?? '',
            name: props.name,
            email: props.email,
            password: props.password,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
            deleted: props.deleted ?? false,
            deletedAt: props.deletedAt ?? null
        });
    }
}
