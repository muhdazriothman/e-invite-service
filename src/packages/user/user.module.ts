import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import {
    MongooseModule,
    getModelToken,
} from '@nestjs/mongoose';
import { PaymentModule } from '@payment/payment.module';
import { SharedModule } from '@shared/shared.module';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { UserRepository } from '@user/infra/repository';
import {
    UserMongoDocument,
    UserMongoModelName,
    UserMongoSchema,
} from '@user/infra/schema';
import { AdminController } from '@user/interfaces/http/controllers/admin';
import { UserController } from '@user/interfaces/http/controllers/user';
import { Model } from 'mongoose';

const createUserRepository = (userModel: Model<UserMongoDocument>) =>
    new UserRepository(userModel);

const createMockUserRepository = () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

@Module({
    imports: [
        AuthModule,
        PaymentModule,
        SharedModule,
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forFeature([
                    { name: UserMongoModelName, schema: UserMongoSchema },
                ]),
            ]),
    ],
    controllers: [UserController, AdminController],
    providers: [
        CreateUserUseCase,
        CreateAdminUseCase,
        ListUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
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
    ],
    exports: ['UserRepository'],
})
export class UserModule {}
