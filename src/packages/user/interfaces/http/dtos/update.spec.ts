import { validate } from 'class-validator';

import { UpdateUserDto } from './update';

describe('@user/interfaces/http/dtos/update', () => {
  it('should be defined', () => {
    expect(UpdateUserDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async() => {
      const dto = new UpdateUserDto();
      dto.name = 'newusername';
      dto.password = 'newpassword123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial data', async() => {
      const dto = new UpdateUserDto();
      dto.name = 'newusername';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty dto', async() => {
      const dto = new UpdateUserDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with short name', async() => {
      const dto = new UpdateUserDto();
      dto.name = 'ab';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should fail validation with short password', async() => {
      const dto = new UpdateUserDto();
      dto.password = '123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should fail validation with non-string name', async() => {
      const dto = new UpdateUserDto();
      (dto as any).name = 123;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });
});
