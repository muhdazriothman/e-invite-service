export interface UserProps {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
}

export class User {
    public id: string;
    public username: string;
    public email: string;
    public passwordHash: string;

    constructor(user: UserProps) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.passwordHash = user.passwordHash;
    }
}
