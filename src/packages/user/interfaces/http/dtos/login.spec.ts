import { validate } from 'class-validator';
import { LoginDto } from '@user/interfaces/http/dtos/login';

describe('@user/interfaces/http/dtos/login', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = new LoginDto();
        dto.username = 'testuser';
        dto.password = 'password123';
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        describe('username', () => {
            it('should fail validate when username is not provided', async () => {
                // @ts-expect-error
                dto.username = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('username');
            });

            it('should fail validate when username is not a string', async () => {
                // @ts-expect-error
                dto.username = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('username');
            });
        });

        describe('password', () => {
            it('should fail validate when password is not provided', async () => {
                // @ts-expect-error
                dto.password = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('password');
            });

            it('should fail validate when password is not a string', async () => {
                // @ts-expect-error
                dto.password = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('password');
            });
        });
    });
});