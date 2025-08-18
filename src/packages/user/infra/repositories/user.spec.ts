import { User } from '@user/domain/entities/user';
import { UserRepositoryImpl } from '@user/infra/repositories/user';

describe('@user/infra/repositories/user', () => {
    let userRepository: UserRepositoryImpl;

    beforeEach(() => {
        userRepository = new UserRepositoryImpl();
    });

    describe('#findByUsername', () => {
        it('should return a user when found by username', async () => {
            const result = await userRepository.findByUsername('admin');

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe('1');
            expect(result?.username).toBe('admin');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.passwordHash).toBe('$2b$10$.wJX6XUYvbImd5I.uxRg5ebJlDlM9NU0N31TgsRRYOoo4F4JEKWtC');
        });

        it('should return null when user is not found', async () => {
            const result = await userRepository.findByUsername('nonexistentuser');

            expect(result).toBeNull();
        });
    });
});