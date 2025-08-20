import { validate } from 'class-validator';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';

describe('@user/interfaces/http/dtos/create', () => {
    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const dto = new CreateUserDto();
            dto.username = 'testuser';
            dto.email = 'test@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('username', () => {
            it('should fail validation when username is not provided', async () => {
                const dto = new CreateUserDto();
                dto.email = 'test@example.com';
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('username');
            });

            it('should fail validation when username is not a string', async () => {
                const dto = new CreateUserDto();
                (dto as any).username = 123;
                dto.email = 'test@example.com';
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('username');
            });
        });

        describe('email', () => {
            it('should fail validation when email is not provided', async () => {
                const dto = new CreateUserDto();
                dto.username = 'testuser';
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('email');
            });

            it('should fail validation when email is not a valid email', async () => {
                const dto = new CreateUserDto();
                dto.username = 'testuser';
                dto.email = 'invalid-email';
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('email');
            });
        });

        describe('password', () => {
            it('should fail validation when password is not provided', async () => {
                const dto = new CreateUserDto();
                dto.username = 'testuser';
                dto.email = 'test@example.com';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
            });

            it('should fail validation when password is not a string', async () => {
                const dto = new CreateUserDto();
                dto.username = 'testuser';
                dto.email = 'test@example.com';
                (dto as any).password = 123;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
            });

            it('should fail validation when password is shorter than 6 characters', async () => {
                const dto = new CreateUserDto();
                dto.username = 'testuser';
                dto.email = 'test@example.com';
                dto.password = '12345';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
            });
        });
    });
});

