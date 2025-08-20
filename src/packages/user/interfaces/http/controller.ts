import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import {
    UserDto,
    UserMapper
} from '@user/interfaces/http/mapper';

@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        @Inject(ListUsersUseCase)
        private readonly listUsersUseCase: ListUsersUseCase,

        @Inject(CreateUserUseCase)
        private readonly createUserUseCase: CreateUserUseCase,
    ) { }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        const user = await this.createUserUseCase.execute(createUserDto);
        return {
            statusCode: 201,
            data: UserMapper.toDto(user),
        };
    }

    @Get()
    async listUsers() {
        const users = await this.listUsersUseCase.execute();

        const data: UserDto[] = [];

        for (const user of users) {
            data.push(UserMapper.toDto(user));
        }

        return {
            statusCode: 200,
            data,
        };
    }
}
