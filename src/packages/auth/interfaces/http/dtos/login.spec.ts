import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { AuthFixture } from '@test/fixture/auth';
import { validate } from 'class-validator';

describe('@auth/interfaces/http/dtos/login', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = AuthFixture.getLoginDto();
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('email', () => {
            it('should pass validation with valid email formats', async () => {
                const validEmails = [
                    'test@example.com',
                    'user.name@domain.co.uk',
                    'admin+test@company.org',
                    'user123@subdomain.example.com',
                ];

                for (const email of validEmails) {
                    dto.email = email;

                    const errors = await validate(dto);
                    expect(errors).toHaveLength(0);
                }
            });

            it('should fail validation when email is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.email;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('email');
            });

            it('should fail validation when email is not a valid email format', async () => {
                dto.email = 'invalid-email';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('email', 'isEmail');
            });

            it('should fail validation when email is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.email = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('email', 'isEmail');
            });

            it('should fail validation with invalid email formats', async () => {
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

                    const errors = await validate(dto);
                    expect(errors).toHaveValidationError('email', 'isEmail');
                }
            });
        });

        describe('password', () => {
            it('should pass validation when password is exactly 6 characters', async () => {
                dto.password = '123456';

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when password is longer than 6 characters', async () => {
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when password is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.password;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password');
            });

            it('should fail validation when password is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.password = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'isString');
            });

            it('should fail validation when password is shorter than 6 characters', async () => {
                dto.password = '12345';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'minLength');
            });
        });
    });
});
