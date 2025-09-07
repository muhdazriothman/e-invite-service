import { PlanType } from '@payment/domain/entities/payment';
import { UserFixture } from '@test/fixture/user';
import {
    User,
    UserType,
} from '@user/domain/entities/user';

describe('@user/domain/entities/user', () => {
    let user: User;
    let userProps: ReturnType<typeof UserFixture.getUserProps>;

    beforeEach(() => {
        userProps = UserFixture.getUserProps({
            id: '123',
            name: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
        });
    });

    describe('#constructor', () => {
        it('should create a User instance with provided props', () => {
            user = new User(userProps);

            expect(user.id).toBe(userProps.id);
            expect(user.name).toBe(userProps.name);
            expect(user.email).toBe(userProps.email);
            expect(user.passwordHash).toBe(userProps.passwordHash);
            expect(user.type).toBe(userProps.type);
            expect(user.capabilities).toEqual(userProps.capabilities);
            expect(user.isDeleted).toBe(userProps.isDeleted);
            expect(user.createdAt).toBe(userProps.createdAt);
            expect(user.updatedAt).toBe(userProps.updatedAt);
            expect(user.deletedAt).toBe(userProps.deletedAt);
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

        it('should handle null deletedAt properly', () => {
            const userWithNullDeletedAt = new User({
                ...userProps,
                deletedAt: null,
            });

            expect(userWithNullDeletedAt.deletedAt).toBeNull();
        });
    });

    describe('#createNewUser', () => {
        let getInvitationLimitSpy: jest.SpyInstance;

        beforeEach(() => {
            getInvitationLimitSpy = jest.spyOn(
                User,
                'getInvitationLimitFromPlanType',
            );
        });

        afterEach(() => {
            getInvitationLimitSpy.mockRestore();
        });

        it('should create a new User instance with default values', () => {
            const createProps = {
                name: 'newuser',
                email: 'newuser@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.USER,
                paymentId: 'payment-id-123',
            };

            const user = User.createNewUser(createProps, PlanType.BASIC);

            expect(getInvitationLimitSpy).toHaveBeenCalledWith(PlanType.BASIC);
            const expectedInvitationLimit =
        getInvitationLimitSpy.mock.results[0].value as number;

            expect(user.id).toBe('');
            expect(user.name).toBe(createProps.name);
            expect(user.email).toBe(createProps.email);
            expect(user.passwordHash).toBe(createProps.passwordHash);
            expect(user.type).toBe(createProps.type);
            expect(user.capabilities?.invitationLimit).toBe(expectedInvitationLimit);
            expect(user.isDeleted).toBe(false);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.deletedAt).toBeNull();
        });

        it('should create an admin user with default values', () => {
            const createProps = {
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.ADMIN,
                paymentId: 'payment-id-123',
            };

            const user = User.createNewUser(createProps, PlanType.BASIC);

            expect(getInvitationLimitSpy).toHaveBeenCalledWith(PlanType.BASIC);
            const expectedInvitationLimit =
        getInvitationLimitSpy.mock.results[0].value as number;

            expect(user.type).toBe(UserType.ADMIN);
            expect(user.name).toBe('admin');
            expect(user.capabilities?.invitationLimit).toBe(expectedInvitationLimit);
            expect(user.isDeleted).toBe(false);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.deletedAt).toBeNull();
        });

        it('should set createdAt and updatedAt to the same timestamp', () => {
            const createProps = {
                name: 'newuser',
                email: 'newuser@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.USER,
                paymentId: 'payment-id-123',
            };

            const user = User.createNewUser(createProps, PlanType.BASIC);

            expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
        });
    });

    describe('#createNewAdmin', () => {
        it('should create a new admin user with unlimited access', () => {
            const createProps = {
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.ADMIN,
                paymentId: 'payment-id-123', // This will be overridden to null
            };

            const user = User.createNewAdmin(createProps);

            expect(user.id).toBe('');
            expect(user.name).toBe(createProps.name);
            expect(user.email).toBe(createProps.email);
            expect(user.passwordHash).toBe(createProps.passwordHash);
            expect(user.type).toBe(UserType.ADMIN);
            expect(user.capabilities).toBeNull(); // Admin users have unlimited access
            expect(user.paymentId).toBeNull(); // No payment required for admin users
            expect(user.isDeleted).toBe(false);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.deletedAt).toBeNull();
        });

        it('should override type to ADMIN regardless of input', () => {
            const createProps = {
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.USER, // This should be overridden
                paymentId: 'payment-id-123',
            };

            const user = User.createNewAdmin(createProps);

            expect(user.type).toBe(UserType.ADMIN);
        });

        it('should set createdAt and updatedAt to the same timestamp', () => {
            const createProps = {
                name: 'admin',
                email: 'admin@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.ADMIN,
                paymentId: 'payment-id-123',
            };

            const user = User.createNewAdmin(createProps);

            expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
        });
    });

    describe('#createFromDb', () => {
        it('should create a User instance from database props', () => {
            const dbProps = {
                id: 'db-user-id',
                name: 'dbuser',
                email: 'dbuser@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.USER,
                capabilities: {
                    invitationLimit: User.getInvitationLimitFromPlanType(PlanType.BASIC),
                },
                paymentId: 'payment-id-123',
                isDeleted: false,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
                deletedAt: null,
            };

            const user = User.createFromDb(dbProps);

            expect(user.id).toBe(dbProps.id);
            expect(user.name).toBe(dbProps.name);
            expect(user.email).toBe(dbProps.email);
            expect(user.passwordHash).toBe(dbProps.passwordHash);
            expect(user.type).toBe(dbProps.type);
            expect(user.capabilities).toEqual(dbProps.capabilities);
            expect(user.isDeleted).toBe(dbProps.isDeleted);
            expect(user.createdAt).toBe(dbProps.createdAt);
            expect(user.updatedAt).toBe(dbProps.updatedAt);
            expect(user.deletedAt).toBe(dbProps.deletedAt);
        });

        it('should create a User instance with deleted status', () => {
            const deletedDate = new Date('2023-01-03');
            const dbProps = {
                id: 'deleted-user-id',
                name: 'deleteduser',
                email: 'deleted@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.USER,
                capabilities: {
                    invitationLimit: User.getInvitationLimitFromPlanType(PlanType.BASIC),
                },
                paymentId: 'payment-id-123',
                isDeleted: true,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-03'),
                deletedAt: deletedDate,
            };

            const user = User.createFromDb(dbProps);

            expect(user.isDeleted).toBe(true);
            expect(user.deletedAt).toBe(deletedDate);
        });
    });

    describe('#getInvitationLimitFromPlanType', () => {
        it('should return correct invitation limit for basic plan', () => {
            const limit = User.getInvitationLimitFromPlanType(PlanType.BASIC);
            expect(limit).toBe(1);
        });

        it('should return correct invitation limit for premium plan', () => {
            const limit = User.getInvitationLimitFromPlanType(PlanType.PREMIUM);
            expect(limit).toBe(3);
        });

        it('should throw error for invalid plan type', () => {
            expect(() => {
                User.getInvitationLimitFromPlanType('invalid' as PlanType);
            }).toThrow('Invalid plan type: invalid');
        });
    });
});
