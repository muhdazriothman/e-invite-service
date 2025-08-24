import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Inject,
    Param,
    UseGuards,
} from '@nestjs/common';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { UpdateUserDto } from '@user/interfaces/http/dtos/update';
import {
    UserDto,
    UserMapper
} from '@user/interfaces/http/mapper';
import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';

@Controller('users')
@UseGuards(AdminAuthGuard)
export class UserController {
    constructor(
        @Inject(ListUsersUseCase)
        private readonly listUsersUseCase: ListUsersUseCase,

        @Inject(CreateUserUseCase)
        private readonly createUserUseCase: CreateUserUseCase,

        @Inject(GetUserByIdUseCase)
        private readonly getUserByIdUseCase: GetUserByIdUseCase,

        @Inject(UpdateUserUseCase)
        private readonly updateUserUseCase: UpdateUserUseCase,

        @Inject(DeleteUserUseCase)
        private readonly deleteUserUseCase: DeleteUserUseCase,
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

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.getUserByIdUseCase.execute(id);

        return {
            statusCode: 200,
            data: UserMapper.toDto(user),
        };
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.updateUserUseCase.execute(id, updateUserDto);

        return {
            statusCode: 200,
            data: UserMapper.toDto(user),
        };
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        await this.deleteUserUseCase.execute(id);

        return {
            statusCode: 200,
            message: 'User deleted successfully',
        };
    }
}
