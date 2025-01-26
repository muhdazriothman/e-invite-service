import bcrypt from 'bcryptjs';

interface UserProps {
    id?: string;
    username: string;
    password: string;
    role: string;
}

export class User {
    id: string | undefined;
    username: string;
    password: string;
    role: string;

    constructor(props: UserProps) {
        this.id = props.id;
        this.username = props.username;
        this.password = props.password;
        this.role = props.role;
    }

    static async create(props: UserProps): Promise<User> {
        const { password } = props;
        const hashedPassword = await bcrypt.hash(password, 10);

        return new User({
            id: props.id,
            username: props.username,
            password: hashedPassword,
            role: props.role,
        });
    }

    async validateUserPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}