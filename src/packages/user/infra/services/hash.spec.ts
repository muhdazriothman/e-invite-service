import { HashServiceImpl } from '@user/infra/services/hash';

describe('@user/infra/services/hash', () => {
    let hashService: HashServiceImpl;

    beforeEach(() => {
        hashService = new HashServiceImpl();
    });

    describe('#hash', () => {
        it('should hash a password correctly', async () => {
            const password = 'testPassword';

            const hashedPassword = await hashService.hash(password);

            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.startsWith('$2b$')).toBe(true);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'testPassword';

            const hash1 = await hashService.hash(password);
            const hash2 = await hashService.hash(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('#compare', () => {
        it('should return true when password matches the hash', async () => {
            const password = 'testPassword';
            const hashedPassword = await hashService.hash(password);

            const result = await hashService.compare(password, hashedPassword);

            expect(result).toBe(true);
        });

        it('should return false when password does not match the hash', async () => {
            const password = 'testPassword';
            const wrongPassword = 'wrongPassword';
            const hashedPassword = await hashService.hash(password);

            const result = await hashService.compare(wrongPassword, hashedPassword);

            expect(result).toBe(false);
        });
    });
});