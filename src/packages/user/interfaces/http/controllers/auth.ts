import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from '@user/interfaces/http/dtos/register';
import { RegisterUseCase } from '@user/application/use-cases/register';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { LoginUseCase } from '@user/application/use-cases/login';
import { UserMapper } from '@user/interfaces/http/mappers/user';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.registerUseCase.execute(registerDto);
        return {
            statusCode: 201,
            data: UserMapper.toDto(user),
        };
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const token = await this.loginUseCase.execute(loginDto);
        return {
            statusCode: 200,
            data: token,
        };
    }
}
