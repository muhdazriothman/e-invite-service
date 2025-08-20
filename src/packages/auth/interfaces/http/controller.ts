import {
    Body,
    Controller,
    Post
} from '@nestjs/common';
import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { LoginUseCase } from '@auth/application/use-cases/login';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const token = await this.loginUseCase.execute(loginDto);
        return {
            statusCode: 200,
            data: token,
        };
    }
}