import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { validate } from 'class-validator';

describe('@auth/interfaces/http/dtos/login', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = new LoginDto();
    });

    it('should pass validation with valid data', async() => {
        dto.email = 'test@example.com';
        dto.password = 'password123';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    describe('email', () => {
        it('should pass validation with valid email formats', async() => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'admin+test@company.org',
                'user123@subdomain.example.com',
            ];

            for (const email of validEmails) {
                dto.email = email;
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            }
        });

        it('should fail validation when email is not provided', async() => {
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should fail validation when email is not a valid email format', async() => {
            dto.email = 'invalid-email';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should fail validation when email is not a string', async() => {
            // @ts-expect-error Testing invalid type assignment
            dto.email = 123;
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should fail validation with invalid email formats', async() => {
            const invalidEmails = [
                'not-an-email',
                '@example.com',
                'test@',
                'test.example.com',
                'test@.com',
                'test@example.',
            ];

            for (const email of invalidEmails) {
                dto.email = email;
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('email');
            }
        });
    });

    describe('password', () => {
        it('should pass validation when password is exactly 6 characters', async() => {
            dto.email = 'test@example.com';
            dto.password = '123456';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation when password is longer than 6 characters', async() => {
            dto.email = 'test@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when password is not provided', async() => {
            dto.email = 'test@example.com';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });

        it('should fail validation when password is not a string', async() => {
            dto.email = 'test@example.com';
            // @ts-expect-error Testing invalid type assignment
            dto.password = 123;

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });

        it('should fail validation when password is shorter than 6 characters', async() => {
            dto.email = 'test@example.com';
            dto.password = '12345';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });
    });
});
