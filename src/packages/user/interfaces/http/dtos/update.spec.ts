import { UserFixture } from '@test/fixture/user';
import { UpdateUserDto } from '@user/interfaces/http/dtos/update';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('@user/interfaces/http/dtos/update', () => {
    describe('#validation', () => {
        it('should pass validation with empty object', async () => {
            const dto = plainToClass(UpdateUserDto, {});
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with partial data', async () => {
            const dto = plainToClass(UpdateUserDto, {
                name: 'Updated User',
            });
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with complete data', async () => {
            const dto = UserFixture.getUpdateDto();
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('name', () => {
            it('should pass validation when name is not provided', async () => {
                const dto = plainToClass(UpdateUserDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when name is provided', async () => {
                const dto = plainToClass(UpdateUserDto, {
                    name: 'Updated User Name',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when name is not a string', async () => {
                const dto = plainToClass(UpdateUserDto, {
                    name: 123,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('name', 'isString');
            });

            it('should fail validation when name is too short', async () => {
                const dto = plainToClass(UpdateUserDto, {
                    name: 'ab',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('name', 'minLength');
            });
        });

        describe('password', () => {
            it('should pass validation when password is not provided', async () => {
                const dto = plainToClass(UpdateUserDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when password is provided', async () => {
                const dto = plainToClass(UpdateUserDto, {
                    password: 'newpassword123',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when password is not a string', async () => {
                const dto = plainToClass(UpdateUserDto, {
                    password: 123,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'isString');
            });

            it('should fail validation when password is too short', async () => {
                const dto = plainToClass(UpdateUserDto, {
                    password: '123',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('password', 'minLength');
            });
        });
    });
});
