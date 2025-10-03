import { UserFixture } from '@test/fixture/user';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';
import { validate } from 'class-validator';

describe('@user/interfaces/http/dtos/create-admin', () => {
    let dto: CreateAdminDto;

    beforeEach(() => {
        dto = UserFixture.getCreateAdminDto();
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('name', () => {
            it('should fail validation when name is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.name;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('name');
            });

            it('should fail validation when name is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.name = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('name', 'isString');
            });

            it('should fail validation when name is empty', async () => {
                dto.name = '';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('name', 'isNotEmpty');
            });
        });

        describe('email', () => {
            it('should fail validation when email is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.email;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('email');
            });

            it('should fail validation when email is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.email = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('email', 'isEmail');
            });

            it('should fail validation when email is not a valid email format', async () => {
                dto.email = 'invalid-email';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('email', 'isEmail');
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
                dto.password = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'isString');
            });

            it('should fail validation when password is too short', async () => {
                dto.password = '12345';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'minLength');
            });
        });
    });
});
