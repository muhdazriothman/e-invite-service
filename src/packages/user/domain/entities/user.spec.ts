import { User, UserProps } from '@user/domain/entities/user';

describe('@user/domain/entities/user', () => {
    let user: User;
    let userProps: UserProps;

    beforeEach(() => {
        userProps = {
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123'
        };
    });

    describe('#constructor', () => {
        it('should create a User instance with provided props', () => {
            user = new User(userProps);

            expect(user.id).toBe(userProps.id);
            expect(user.username).toBe(userProps.username);
            expect(user.email).toBe(userProps.email);
            expect(user.passwordHash).toBe(userProps.passwordHash);
        });
    });
});