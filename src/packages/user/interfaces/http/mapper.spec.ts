import { UserMapper } from '@user/interfaces/http/mapper';
import {
    User,
    UserType,
    PlanType,
} from '@user/domain/entities/user';
import { PlanConfig } from '@user/domain/value-objects/plan-config';

describe('@user/interfaces/http/mapper', () => {
    describe('#toDto', () => {
        it('should map User entity to RegisterResponseDto', () => {
            const userProps = {
                id: '123',
                name: 'testuser',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
                type: UserType.USER,
                plan: PlanConfig.create(PlanType.BASIC),
                isDeleted: false,
                createdAt: new Date('2025-08-28T13:18:25.375Z'),
                updatedAt: new Date('2025-08-28T13:18:25.375Z'),
                deletedAt: null,
            };

            const user = new User(userProps);
            const result = UserMapper.toDto(user);

            expect(result).toEqual({
                id: userProps.id,
                name: userProps.name,
                email: userProps.email,
                plan: {
                    type: PlanType.BASIC,
                    invitationLimit: 1,
                    name: 'Basic Plan',
                    description: 'Create 1 invitation',
                },
                createdAt: userProps.createdAt.toISOString(),
                updatedAt: userProps.updatedAt.toISOString(),
            });
        });
    });
});
