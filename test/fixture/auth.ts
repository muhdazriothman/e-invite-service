import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { plainToClass } from 'class-transformer';

export class AuthFixture {
    static getLoginDto (
        params: Partial<LoginDto> = {},
    ): LoginDto {
        const {
            email = 'testuser@example.com',
            password = 'password123',
        } = params;

        const plainData = {
            email,
            password,
        };

        return plainToClass(LoginDto, plainData);
    }
}

