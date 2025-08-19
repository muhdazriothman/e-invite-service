import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterDto } from '@user/interfaces/http/dtos/register';
import { RegisterUserUseCase } from '@user/application/use-cases/register';
import { LoginDto } from '@user/interfaces/http/dtos/login';
import { LoginUseCase } from '@user/application/use-cases/login';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UserMapper } from '@user/interfaces/http/mappers/user';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUserUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
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

    @Get('users')
    async listUsers() {
        const users = await this.listUsersUseCase.execute();
        return {
            statusCode: 200,
            data: users.map(user => UserMapper.toListDto(user)),
        };
    }
}
