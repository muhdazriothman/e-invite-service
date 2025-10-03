import { InvitationService } from '@invitation/application/services/invitation';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    InvitationHydrated,
    InvitationMongoModelName,
    InvitationMongoSchema,
} from '@invitation/infra/schema';
import { InvitationController } from '@invitation/interfaces/http/controller';
import { UserContextMiddleware } from '@invitation/interfaces/http/middleware/user-context.middleware';
import {
    Module,
    NestModule,
    MiddlewareConsumer,
} from '@nestjs/common';
import {
    MongooseModule,
    getModelToken,
} from '@nestjs/mongoose';
import { DateValidator } from '@shared/utils/date';
import { UserRepository } from '@user/infra/repository';
import {
    UserMongoModelName,
    UserMongoSchema,
    UserHydrated,
} from '@user/infra/schema';
import { Model } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: InvitationMongoModelName,
                schema: InvitationMongoSchema,
            },
            {
                name: UserMongoModelName,
                schema: UserMongoSchema,
            },
        ]),
    ],
    controllers: [InvitationController],
    providers: [
        {
            provide: InvitationRepository,
            useFactory: (invitationModel: Model<InvitationHydrated>) => new InvitationRepository(invitationModel),
            inject: [getModelToken(InvitationMongoModelName)],
        },
        {
            provide: UserRepository,
            useFactory: (userModel: Model<UserHydrated>) => new UserRepository(userModel),
            inject: [getModelToken(UserMongoModelName)],
        },
        {
            provide: DateValidator,
            useFactory: () =>
                new DateValidator({ format: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'' }),
        },
        InvitationService,
        CreateInvitationUseCase,
        ListInvitationsUseCase,
        GetInvitationByIdUseCase,
        UpdateInvitationUseCase,
        DeleteInvitationUseCase,
        UserContextMiddleware,
    ],
    exports: [InvitationRepository, DateValidator],
})
export class InvitationModule implements NestModule {
    // eslint-disable-next-line class-methods-use-this
    configure (consumer: MiddlewareConsumer) {
        consumer.apply(UserContextMiddleware).forRoutes('invitations');
    }
}
