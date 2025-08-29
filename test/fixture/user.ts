import {
    User,
    UserType,
    PlanType,
} from '@user/domain/entities/user';
import { PlanConfig } from '@user/domain/value-objects/plan-config';

export class UserFixture {
    static getUserProps(props: Partial<User> = {}) {
        const {
            id = '1',
            name = 'testuser',
            email = 'testuser@example.com',
            passwordHash = 'hashed_password',
            type = UserType.USER,
            plan: planConfig = PlanConfig.create(PlanType.BASIC),
            isDeleted = false,
            createdAt = new Date(),
            updatedAt = new Date(),
            deletedAt = null,
        } = props;

        return {
            id,
            name,
            email,
            passwordHash,
            type,
            plan: planConfig,
            isDeleted,
            createdAt,
            updatedAt,
            deletedAt,
        };
    }

    static getUserEntity(params: Partial<User> = {}) {
        const props = UserFixture.getUserProps(params);
        return new User(props);
    }

    static getAdminUser() {
        return UserFixture.getUserEntity({
            id: '1',
            name: 'admin',
            email: 'admin@example.com',
            passwordHash: 'hashed_password',
            type: UserType.ADMIN,
        });
    }

    static getNewUser() {
        return UserFixture.getUserEntity({
            id: '123',
            name: 'newuser',
            email: 'newuser@example.com',
            passwordHash: 'hashed_password',
            type: UserType.USER,
        });
    }
}
