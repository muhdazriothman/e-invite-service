import { UserType } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { validate } from 'class-validator';

describe('@user/interfaces/http/dtos/create', () => {
    let dto: CreateUserDto;

    beforeEach(() => {
        dto = new CreateUserDto();
    });

    describe('validation', () => {
        it('should pass validation with valid data', async() => {
            dto.name = 'John Doe';
            dto.email = 'john@example.com';
            dto.password = 'password123';
            dto.type = UserType.USER;
            dto.paymentId = '507f1f77bcf86cd799439011';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        describe('name', () => {
            it('should pass validation with valid name', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with empty name', async() => {
                dto.name = '';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('name');
                expect(errors[0].constraints).toHaveProperty('isNotEmpty');
            });
        });

        describe('email', () => {
            it('should pass validation with valid email', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with invalid email', async() => {
                dto.name = 'John Doe';
                dto.email = 'invalid-email';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('email');
                expect(errors[0].constraints).toHaveProperty('isEmail');
            });
        });

        describe('password validation', () => {
            it('should pass validation with valid email', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with short password', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = '123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
                expect(errors[0].constraints).toHaveProperty('minLength');
            });
        });

        describe('type', () => {
            it('should pass validation with valid user type', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.ADMIN;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with invalid user type', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                // @ts-expect-error Testing invalid enum value
                dto.type = 'invalid';
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('type');
                expect(errors[0].constraints).toHaveProperty('isEnum');
            });
        });

        describe('paymentId', () => {
            it('should pass validation with valid string', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '507f1f77bcf86cd799439011';

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            });

            it('should fail validation with empty string', async() => {
                dto.name = 'John Doe';
                dto.email = 'john@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;
                dto.paymentId = '';

                const errors = await validate(dto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('paymentId');
                expect(errors[0].constraints).toHaveProperty('isNotEmpty');
            });
        });
    });
});
