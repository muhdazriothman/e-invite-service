import { validate } from 'class-validator';

import { CreateAdminDto } from './create-admin';

describe('CreateAdminDto', () => {
    let dto: CreateAdminDto;

    beforeEach(() => {
        dto = new CreateAdminDto();
    });

    describe('name', () => {
        it('should pass validation with valid name', async() => {
            dto.name = 'Admin User';
            dto.email = 'admin@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            const nameErrors = errors.filter(error => error.property === 'name');

            expect(nameErrors).toHaveLength(0);
        });

        it('should fail validation with empty name', async() => {
            dto.name = '';
            dto.email = 'admin@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            const nameErrors = errors.filter(error => error.property === 'name');

            expect(nameErrors).toHaveLength(1);
            expect(nameErrors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with non-string name', async() => {
            // @ts-expect-error Testing validation error for non-string value
            dto.name = 123;
            dto.email = 'admin@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            const nameErrors = errors.filter(error => error.property === 'name');

            expect(nameErrors).toHaveLength(1);
            expect(nameErrors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('email', () => {
        it('should pass validation with valid email', async() => {
            dto.name = 'Admin User';
            dto.email = 'admin@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            const emailErrors = errors.filter(error => error.property === 'email');

            expect(emailErrors).toHaveLength(0);
        });

        it('should fail validation with invalid email', async() => {
            dto.name = 'Admin User';
            dto.email = 'invalid-email';
            dto.password = 'password123';

            const errors = await validate(dto);
            const emailErrors = errors.filter(error => error.property === 'email');

            expect(emailErrors).toHaveLength(1);
            expect(emailErrors[0].constraints).toHaveProperty('isEmail');
        });
    });

    describe('password', () => {
        it('should pass validation with valid password', async() => {
            dto.name = 'Admin User';
            dto.email = 'admin@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');

            expect(passwordErrors).toHaveLength(0);
        });

        it('should fail validation with short password', async() => {
            dto.name = 'Admin User';
            dto.email = 'admin@example.com';
            dto.password = '12345';

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');

            expect(passwordErrors).toHaveLength(1);
            expect(passwordErrors[0].constraints).toHaveProperty('minLength');
        });

        it('should fail validation with non-string password', async() => {
            dto.name = 'Admin User';
            dto.email = 'admin@example.com';
            // @ts-expect-error Testing validation error for non-string value
            dto.password = 123;

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');

            expect(passwordErrors).toHaveLength(1);
            expect(passwordErrors[0].constraints).toHaveProperty('isString');
        });
    });
});
