import { validate } from 'class-validator';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { UserType } from '@user/domain/entities/user';

describe('@user/interfaces/http/dtos/create', () => {
    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const dto = new CreateUserDto();
            dto.name = 'testuser';
            dto.email = 'test@example.com';
            dto.password = 'password123';
            dto.type = UserType.USER;

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('name', () => {
            it('should fail validation when name is not provided', async () => {
                const dto = new CreateUserDto();
                dto.email = 'test@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('name');
            });

            it('should fail validation when username is not a string', async () => {
                const dto = new CreateUserDto();
                (dto as any).name = 123;
                dto.email = 'test@example.com';
                dto.password = 'password123';
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('name');
            });
        });

        describe('email', () => {
            it('should fail validation when email is not provided', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.password = 'password123';
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('email');
            });

            it('should fail validation when email is not a valid email', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'invalid-email';
                dto.password = 'password123';
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('email');
            });
        });

        describe('password', () => {
            it('should fail validation when password is not provided', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'test@example.com';
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
            });

            it('should fail validation when password is not a string', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'test@example.com';
                (dto as any).password = 123;
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
            });

            it('should fail validation when password is shorter than 6 characters', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'test@example.com';
                dto.password = '12345';
                dto.type = UserType.USER;

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('password');
            });
        });

        describe('type', () => {
            it('should fail validation when type is not provided', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'test@example.com';
                dto.password = 'password123';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('type');
            });

            it('should fail validation when type is not a valid enum value', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'test@example.com';
                dto.password = 'password123';
                (dto as any).type = 'invalid';

                const errors = await validate(dto);
                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('type');
            });

            it('should pass validation with valid type values', async () => {
                const dto = new CreateUserDto();
                dto.name = 'testuser';
                dto.email = 'test@example.com';
                dto.password = 'password123';
                dto.type = UserType.ADMIN;

                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });
        });
    });
});

