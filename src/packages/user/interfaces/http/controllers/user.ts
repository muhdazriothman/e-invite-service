import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
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
} from '@nestjs/swagger';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { UpdateUserDto } from '@user/interfaces/http/dtos/update';
import {
    UserMapper,
    UserDto,
    UserResponseDto,
    UserListResponseDto,
} from '@user/interfaces/http/mapper';

@ApiTags('users')
@Controller('users')
@UseGuards(AdminAuthGuard)
export class UserController {
    constructor(
    @Inject(CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,

    @Inject(ListUsersUseCase)
    private readonly listUsersUseCase: ListUsersUseCase,

    @Inject(GetUserByIdUseCase)
    private readonly getUserByIdUseCase: GetUserByIdUseCase,

    @Inject(UpdateUserUseCase)
    private readonly updateUserUseCase: UpdateUserUseCase,

    @Inject(DeleteUserUseCase)
    private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
      status: 201,
      description: 'User created successfully',
      type: UserResponseDto,
  })
  @ApiResponse({
      status: 400,
      description: 'Bad request - validation failed',
  })
  @ApiResponse({
      status: 409,
      description: 'Conflict - user with this email already exists',
  })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const user = await this.createUserUseCase.execute(createUserDto);

        return {
            message: 'User created successfully',
            data: UserMapper.toDto(user),
        };
    }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
      status: 200,
      description: 'List of users retrieved successfully',
      type: UserListResponseDto,
  })
  async listUsers() {
      const users = await this.listUsersUseCase.execute();

      const data: UserDto[] = [];

      for (const user of users) {
          data.push(UserMapper.toDto(user));
      }

      return {
          message: 'Users retrieved successfully',
          data,
      };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
      status: 200,
      description: 'User retrieved successfully',
      type: UserResponseDto,
  })
  @ApiResponse({
      status: 404,
      description: 'User not found',
  })
  async getUserById(@Param('id') id: string) {
      const user = await this.getUserByIdUseCase.execute(id);

      return {
          message: 'User retrieved successfully',
          data: UserMapper.toDto(user),
      };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
      status: 200,
      description: 'User updated successfully',
      type: UserResponseDto,
  })
  @ApiResponse({
      status: 404,
      description: 'User not found',
  })
  @ApiResponse({
      status: 400,
      description: 'Bad request - validation failed',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
      const user = await this.updateUserUseCase.execute(id, updateUserDto);

      return {
          message: 'User updated successfully',
          data: UserMapper.toDto(user),
      };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
      status: 200,
      description: 'User deleted successfully',
  })
  @ApiResponse({
      status: 404,
      description: 'User not found',
  })
  async deleteUser(@Param('id') id: string) {
      await this.deleteUserUseCase.execute(id);

      return {
          message: 'User deleted successfully',
      };
  }
}
