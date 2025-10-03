import { UserFixture } from '@test/fixture/user';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { validate } from 'class-validator';

describe('@user/interfaces/http/dtos/login', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = UserFixture.getLoginDto();
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('username', () => {
            it('should fail validation when username is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.username;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('username');
            });

            it('should fail validation when username is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.username = 1;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('username', 'isString');
            });
        });

        describe('password', () => {
            it('should fail validation when password is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.password;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password');
            });

            it('should fail validation when password is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.password = 1;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'isString');
            });
        });
    });
});
