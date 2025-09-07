import { LoginUseCase } from '@auth/application/use-cases/login';
import { LoginDto } from '@auth/interfaces/http/dtos/login';
import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
      status: 200,
      description: 'User logged in successfully',
  })
  @ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
  })
  @ApiResponse({
      status: 401,
      description: 'Unauthorized - invalid credentials',
  })
    async login(@Body() loginDto: LoginDto) {
        const token = await this.loginUseCase.execute(loginDto);
        return {
            statusCode: 200,
            data: token,
        };
    }
}
