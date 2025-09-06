import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';

import { UserController } from '@user/interfaces/http/controller';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import { ListUsersUseCase } from '@user/application/use-cases/list';
import { GetUserByIdUseCase } from '@user/application/use-cases/get-by-id';
import { UpdateUserUseCase } from '@user/application/use-cases/update';
import { DeleteUserUseCase } from '@user/application/use-cases/delete';
import { UserAuthService } from '@user/application/services/user-auth.service';

import { SharedModule } from '@shared/shared.module';

@Module({
    imports: [
        AuthModule,
        SharedModule,
    ],
    controllers: [UserController],
    providers: [
        CreateUserUseCase,
        ListUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        {
            provide: 'UserAuthService',
            useClass: UserAuthService,
        },
    ],
    exports: [
        'UserAuthService',
    ],
})
export class UserModule { }
