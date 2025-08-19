import { User } from '@user/domain/entities/user';
import { UserFixture } from '@test/fixture/user';

describe('@user/domain/entities/user', () => {
    let user: User;
    let userProps: any;

    beforeEach(() => {
        userProps = UserFixture.getUserProps({
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
        });
    });

    describe('#constructor', () => {
        it('should create a User instance with provided props', () => {
            user = new User(userProps);

            expect(user.id).toBe(userProps.id);
            expect(user.username).toBe(userProps.username);
            expect(user.email).toBe(userProps.email);
            expect(user.passwordHash).toBe(userProps.passwordHash);
            expect(user.isDeleted).toBe(false);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.deletedAt).toBeNull();
        });

        it('should create a User instance with custom audit fields', () => {
            const customDate = new Date('2023-01-01');
            const userWithAudit = new User({
                ...userProps,
                isDeleted: true,
                createdAt: customDate,
                updatedAt: customDate,
                deletedAt: customDate,
            });

            expect(userWithAudit.isDeleted).toBe(true);
            expect(userWithAudit.createdAt).toBe(customDate);
            expect(userWithAudit.updatedAt).toBe(customDate);
            expect(userWithAudit.deletedAt).toBe(customDate);
        });
    });
});
