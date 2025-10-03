import { Module } from '@nestjs/common';
import {
    MongooseModule,
    getModelToken,
} from '@nestjs/mongoose';
import { PaymentModule } from '@payment/payment.module';
import { UserService } from '@user/application/services/user';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { UserRepository } from '@user/infra/repository';
import {
    UserMongoModelName,
    UserMongoSchema,
    UserHydrated,
} from '@user/infra/schema';
import { AdminController } from '@user/interfaces/http/controllers/admin';
import { UserController } from '@user/interfaces/http/controllers/user';
import { Model } from 'mongoose';

@Module({
    imports: [
        PaymentModule,
        MongooseModule.forFeature([
            {
                name: UserMongoModelName,
                schema: UserMongoSchema,
            },
        ]),
    ],
    controllers: [UserController, AdminController],
    providers: [
        {
            provide: UserRepository,
            useFactory: (userModel: Model<UserHydrated>) => new UserRepository(userModel),
            inject: [getModelToken(UserMongoModelName)],
        },
        UserService,
        CreateUserUseCase,
        CreateAdminUseCase,
        ListUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
    exports: [UserRepository],
})
export class UserModule {}
