import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import { PaymentModule } from '@payment/payment.module';
import { SharedModule } from '@shared/shared.module';
import { UserAuthService } from '@user/application/services/user-auth.service';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { AdminController } from '@user/interfaces/http/controllers/admin';
import { UserController } from '@user/interfaces/http/controllers/user';

@Module({
    imports: [AuthModule, PaymentModule, SharedModule],
    controllers: [UserController, AdminController],
    providers: [
        CreateUserUseCase,
        CreateAdminUseCase,
        ListUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        {
            provide: 'UserAuthService',
            useClass: UserAuthService,
        },
    ],
    exports: ['UserAuthService'],
})
export class UserModule {}
