import { validate } from 'class-validator';
import { RegisterDto } from '@user/interfaces/http/dtos/register';

describe('@user/interfaces/http/dtos/register', () => {
  let dto: RegisterDto;

  beforeEach(() => {
    dto = new RegisterDto();
    dto.username = 'testuser';
    dto.email = 'test@example.com';
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

    describe('email', () => {
      it('should fail validate when email is not provided', async () => {
        // @ts-expect-error
        dto.email = undefined;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('email');
      });

      it('should fail validate when email is not a valid email', async () => {
        dto.email = 'not-an-email';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('email');
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

      it('should fail validate when password is shorter than 6 characters', async () => {
        dto.password = '12345';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
      });
    });
  });
});
