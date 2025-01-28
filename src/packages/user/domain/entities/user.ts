import bcrypt from 'bcryptjs';

interface UserProps {
    id?: string;
    username: string;
    password: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
}

export class User {
    id: string | undefined;
    username: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;

    constructor(props: UserProps) {
        this.id = props.id;
        this.username = props.username;
        this.password = props.password;
        this.role = props.role;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
        this.deleted = props.deleted || false;
        this.deletedAt = props.deletedAt || null;
    }

    static async create(props: UserProps): Promise<User> {
        const { password } = props;
        const hashedPassword = await bcrypt.hash(password, 10);

        return new User({
            id: props.id,
            username: props.username,
            password: hashedPassword,
            role: props.role,
            createdAt: new Date(),
            updatedAt: new Date(),
            deleted: false,
            deletedAt: null
        });
    }

    async validateUserPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}