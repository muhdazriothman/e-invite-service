import { UserFixture } from '@test/fixture/user';
import { UserMapper } from '@user/interfaces/http/mapper';

describe('@user/interfaces/http/mapper', () => {
    describe('#toDto', () => {
        it('should map User entity to UserDto', () => {
            const user = UserFixture.getEntity();

            const result = UserMapper.toDto(user);

            expect(result).toEqual({
                id: user.id,
                name: user.name,
                email: user.email,
                capabilities: user.capabilities,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            });
        });
    });
});
