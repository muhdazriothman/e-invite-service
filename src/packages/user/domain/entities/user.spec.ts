import { PlanType } from '@payment/domain/entities/payment';
import { UserFixture } from '@test/fixture/user';
import {
    User,
    UserType,
} from '@user/domain/entities/user';
import { Types } from 'mongoose';

describe('@user/domain/entities/user', () => {
    let user: User;
    let userProps: ReturnType<typeof UserFixture.getProps>;

    beforeEach(() => {
        userProps = UserFixture.getProps();
    });

    describe('#constructor', () => {
        it('should create a User instance', () => {
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

        it('should create a new user', () => {
            const user = User.createNewUser(userProps, PlanType.BASIC);

            expect(getInvitationLimitSpy).toHaveBeenCalledWith(PlanType.BASIC);

            const expectedInvitationLimit = getInvitationLimitSpy.mock.results[0].value as number;

            expect(user).toBeInstanceOf(User);
            expect(user).toMatchObject({
                id: '',
                name: userProps.name,
                email: userProps.email,
                passwordHash: userProps.passwordHash,
                type: userProps.type,
                capabilities: {
                    invitationLimit: expectedInvitationLimit,
                },
                paymentId: userProps.paymentId,
                isDeleted: false,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                deletedAt: null,
            });

            expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
        });
    });

    describe('#createNewAdmin', () => {
        it('should create a new admin', () => {
            const user = User.createNewAdmin(userProps);

            expect(user).toBeInstanceOf(User);
            expect(user).toMatchObject({
                id: '',
                name: userProps.name,
                email: userProps.email,
                passwordHash: userProps.passwordHash,
                type: UserType.ADMIN,
                capabilities: null,
                paymentId: null,
                isDeleted: false,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                deletedAt: null,
            });

            expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
        });

        it('should set type to `admin` regardless of input', () => {
            userProps.type = UserType.USER; // This should be overridden

            const user = User.createNewAdmin(userProps);

            expect(user).toBeInstanceOf(User);
            expect(user.type).toBe(UserType.ADMIN);
        });
    });

    describe('#createFromDb', () => {
        it('should create a User instance', () => {
            const dbProps = {
                _id: new Types.ObjectId('000000000000000000000001'),
                name: 'dbuser',
                email: 'dbuser@example.com',
                passwordHash: 'hashedpassword123',
                type: UserType.USER,
                capabilities: {
                    invitationLimit: User.getInvitationLimitFromPlanType(PlanType.BASIC),
                },
                paymentId: new Types.ObjectId('000000000000000000000002'),
                isDeleted: false,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
                deletedAt: null,
            };

            const user = User.createFromDb(dbProps);

            expect(user).toBeInstanceOf(User);
            expect(user).toMatchObject({
                id: dbProps._id.toString(),
                name: dbProps.name,
                email: dbProps.email,
                passwordHash: dbProps.passwordHash,
                type: dbProps.type,
                capabilities: dbProps.capabilities,
                paymentId: dbProps.paymentId.toString(),
                isDeleted: dbProps.isDeleted,
                createdAt: dbProps.createdAt,
                updatedAt: dbProps.updatedAt,
                deletedAt: dbProps.deletedAt,
            });
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
