import { HashService } from '@user/application/interfaces/hash-service';

describe('@user/application/interfaces/hash-service', () => {
    let hashService: HashService;

    beforeEach(() => {
        hashService = {
            hash: jest.fn(),
            compare: jest.fn()
        };
    });

    describe('hash', () => {
        it('should hash a password', async () => {
            const password = 'test-password';
            const hashedPassword = 'hashed-password';

            jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);

            const result = await hashService.hash(password);

            expect(result).toBe(hashedPassword);
            expect(hashService.hash).toHaveBeenCalledWith(password);
        });

        it('should return different hashes for the same password when called multiple times', async () => {
            const password = 'test-password';

            jest.spyOn(hashService, 'hash')
                .mockResolvedValueOnce('hashed-password-1')
                .mockResolvedValueOnce('hashed-password-2');

            const result1 = await hashService.hash(password);
            const result2 = await hashService.hash(password);

            expect(result1).not.toBe(result2);
        });
    });

    describe('compare', () => {
        it('should return true when plain password matches the hash', async () => {
            const plainPassword = 'test-password';
            const hashedPassword = 'hashed-password';

            jest.spyOn(hashService, 'compare').mockResolvedValue(true);

            const result = await hashService.compare(plainPassword, hashedPassword);

            expect(result).toBe(true);
            expect(hashService.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
        });

        it('should return false when plain password does not match the hash', async () => {
            const plainPassword = 'wrong-password';
            const hashedPassword = 'hashed-password';

            jest.spyOn(hashService, 'compare').mockResolvedValue(false);

            const result = await hashService.compare(plainPassword, hashedPassword);

            expect(result).toBe(false);
            expect(hashService.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
        });
    });
});