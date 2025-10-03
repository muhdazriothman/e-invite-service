import { BasicAuthGuard } from '@auth/interfaces/http/guards/basic-auth';
import {
    Controller,
    Post,
    Body,
    Inject,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiSecurity,
} from '@nestjs/swagger';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';
import {
    UserMapper,
    UserResponseDto,
} from '@user/interfaces/http/mapper';

@ApiTags('admins')
@Controller('admins')
@UseGuards(BasicAuthGuard)
@ApiSecurity('basic')
export class AdminController {
    constructor (
        @Inject(CreateAdminUseCase)
        private readonly createAdminUseCase: CreateAdminUseCase,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new admin user' })
    @ApiBody({ type: CreateAdminDto })
    @ApiResponse({
        status: 201,
        description: 'Admin created successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid basic auth credentials',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - user with this email already exists',
    })
    async createAdmin (
        @Body() createAdminDto: CreateAdminDto,
    ) {
        const admin = await this.createAdminUseCase.execute(createAdminDto);

        return {
            message: 'Admin created successfully',
            data: UserMapper.toDto(admin),
        };
    }
}
