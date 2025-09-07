import { LoginDto } from '@user/interfaces/http/dtos/login';
import { validate } from 'class-validator';

describe('@user/interfaces/http/dtos/login', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = new LoginDto();
        dto.username = 'testuser';
        dto.password = 'password123';
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async() => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        describe('username', () => {
            it('should fail validate when username is not provided', async() => {
                // @ts-expect-error - Testing undefined username
                dto.username = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('username');
            });

            it('should fail validate when username is not a string', async() => {
                // @ts-expect-error - Testing non-string username
                dto.username = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('username');
            });
        });

        describe('password', () => {
            it('should fail validate when password is not provided', async() => {
                // @ts-expect-error - Testing undefined password
                dto.password = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('password');
            });

            it('should fail validate when password is not a string', async() => {
                // @ts-expect-error - Testing non-string password
                dto.password = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('password');
            });
        });
    });
});
