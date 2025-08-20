import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { UserController } from '@user/interfaces/http/controller';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { CreateUserUseCase } from '@user/application/use-cases/create';
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
        ListUsersUseCase,
        CreateUserUseCase,
    ],
    exports: ['UserRepository'],
})
export class UserModule { }
