import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { UserController } from '@user/interfaces/http/controller';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { UserRepository } from '@user/infra/repository';
import { UserMongoModelName, UserMongoSchema } from '@user/infra/schema';
import { HashService } from '@common/services/hash';

// Mock factory for testing
const createMockUserRepository = () =>
    new UserRepository({
        findOne: () => ({ lean: async () => null }),
        create: async (user: any) => ({
            toObject: () => ({ _id: 'test', ...user }),
        }),
        find: () => ({ lean: async () => [] }),
    } as any);

// Production repository factory
const createUserRepository = (userModel: any) =>
    new UserRepository(userModel);

@Module({
    imports: [
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forFeature([
                    { name: UserMongoModelName, schema: UserMongoSchema },
                ]),
            ]),
    ],
    controllers: [UserController],
    providers: [
        {
            provide: 'UserRepository',
            useFactory:
                process.env.NODE_ENV === 'test'
                    ? createMockUserRepository
                    : createUserRepository,
            inject:
                process.env.NODE_ENV === 'test'
                    ? []
                    : [getModelToken(UserMongoModelName)],
        },
        {
            provide: 'HashService',
            useClass: HashService,
        },
        CreateUserUseCase,
        ListUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
    exports: ['UserRepository'],
})
export class UserModule { }
