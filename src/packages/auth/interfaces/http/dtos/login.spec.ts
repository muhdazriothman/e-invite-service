import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { validate } from 'class-validator';


describe('@auth/interfaces/http/dtos/login', () => {
  describe('#validation', () => {
    it('should pass validation with valid data', async() => {
      const dto = new LoginDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    describe('email', () => {
      it('should fail validation when email is not provided', async() => {
        const dto = new LoginDto();
        dto.password = 'password123';

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
      });

      it('should fail validation when email is not a valid email format', async() => {
        const dto = new LoginDto();
        dto.email = 'invalid-email';
        dto.password = 'password123';

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
      });

      it('should fail validation when email is not a string', async() => {
        const dto = new LoginDto();
        (dto as any).email = 123;
        dto.password = 'password123';

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
      });

      it('should pass validation with valid email formats', async() => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'admin+test@company.org',
          'user123@subdomain.example.com',
        ];

        for (const email of validEmails) {
          const dto = new LoginDto();
          dto.email = email;
          dto.password = 'password123';

          const errors = await validate(dto);
          expect(errors).toHaveLength(0);
        }
      });

      it('should fail validation with invalid email formats', async() => {
        const invalidEmails = [
          'not-an-email',
          '@example.com',
          'test@',
          'test.example.com',
          'test@.com',
          'test@example.',
        ];

        for (const email of invalidEmails) {
          const dto = new LoginDto();
          dto.email = email;
          dto.password = 'password123';

          const errors = await validate(dto);
          expect(errors).toHaveLength(1);
          expect(errors[0].property).toBe('email');
        }
      });
    });

    describe('password', () => {
      it('should fail validation when password is not provided', async() => {
        const dto = new LoginDto();
        dto.email = 'test@example.com';

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('password');
      });

      it('should fail validation when password is not a string', async() => {
        const dto = new LoginDto();
        dto.email = 'test@example.com';
        (dto as any).password = 123;

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('password');
      });

      it('should fail validation when password is shorter than 6 characters', async() => {
        const dto = new LoginDto();
        dto.email = 'test@example.com';
        dto.password = '12345';

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('password');
      });

      it('should pass validation when password is exactly 6 characters', async() => {
        const dto = new LoginDto();
        dto.email = 'test@example.com';
        dto.password = '123456';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should pass validation when password is longer than 6 characters', async() => {
        const dto = new LoginDto();
        dto.email = 'test@example.com';
        dto.password = 'password123';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should pass validation with various valid password formats', async() => {
        const validPasswords = [
          '123456',
          'password',
          'P@ssw0rd',
          'mySecurePassword123',
          'test123!@#',
        ];

        for (const password of validPasswords) {
          const dto = new LoginDto();
          dto.email = 'test@example.com';
          dto.password = password;

          const errors = await validate(dto);
          expect(errors).toHaveLength(0);
        }
      });
    });

    describe('combined validation', () => {
      it('should fail validation when both email and password are missing', async() => {
        const dto = new LoginDto();

        const errors = await validate(dto);
        expect(errors).toHaveLength(2);
        expect(errors.map((e) => e.property)).toContain('email');
        expect(errors.map((e) => e.property)).toContain('password');
      });

      it('should fail validation when email is invalid and password is too short', async() => {
        const dto = new LoginDto();
        dto.email = 'invalid-email';
        dto.password = '12345';

        const errors = await validate(dto);
        expect(errors).toHaveLength(2);
        expect(errors.map((e) => e.property)).toContain('email');
        expect(errors.map((e) => e.property)).toContain('password');
      });

      it('should pass validation with valid email and password', async() => {
        const dto = new LoginDto();
        dto.email = 'user@example.com';
        dto.password = 'securePassword123';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });
  });
});
