import { UserFixture } from '@test/fixture/user';
import { UserType } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { validate } from 'class-validator';

describe('@user/interfaces/http/dtos/create', () => {
    let dto: CreateUserDto;

    beforeEach(() => {
        dto = UserFixture.getCreateDto();
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
                dto.password = '123';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'minLength');
            });
        });

        describe('type', () => {
            const validTypes = [UserType.USER, UserType.ADMIN];

            for (const type of validTypes) {
                it(`should pass validation when type is ${type}`, async () => {
                    dto.type = type;

                    const errors = await validate(dto);
                    expect(errors).toHaveLength(0);
                });
            }

            it('should fail validation when type is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.type;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('type');
            });

            it('should fail validation when type is not a valid enum value', async () => {
                // @ts-expect-error - we want to test the validation
                dto.type = 'invalid';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('type', 'isEnum');
            });
        });

        describe('paymentId', () => {
            it('should fail validation when paymentId is not provided', async () => {
                // @ts-expect-error - we want to test the validation
                delete dto.paymentId;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('paymentId');
            });

            it('should fail validation when paymentId is not a string', async () => {
                // @ts-expect-error - we want to test the validation
                dto.paymentId = 123;

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('paymentId', 'isString');
            });

            it('should fail validation when paymentId is empty', async () => {
                dto.paymentId = '';

                const errors = await validate(dto);
                expect(errors).toHaveValidationError('paymentId', 'isNotEmpty');
            });
        });
    });
});
