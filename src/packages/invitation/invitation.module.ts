import {
    Module,
    NestModule,
    MiddlewareConsumer,
} from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { InvitationController } from '@invitation/interfaces/http/controller';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { InvitationRepository } from '@invitation/infra/repository';
import { InvitationMongoModelName, InvitationMongoSchema } from '@invitation/infra/schema';
import { DateValidator } from '@shared/utils/date';
import { UserRepository } from '@user/infra/repository';
import { UserMongoModelName, UserMongoSchema } from '@user/infra/schema';
import { UserContextMiddleware } from '@invitation/interfaces/http/middleware/user-context.middleware';
import { Invitation } from '@invitation/domain/entities/invitation';

// Mock factory for testing
const createMockInvitationRepository = () =>
    new InvitationRepository({
        create: async (invitation: Invitation) => ({
            ...invitation,
            id: 'test',
        }),
        findOne: () => ({ lean: async () => null }),
        find: () => ({ lean: async () => [] }),
        findOneAndUpdate: () => ({ lean: async () => null }),
        updateOne: async () => ({ modifiedCount: 0 }),
    } as unknown as typeof InvitationRepository.prototype['invitationModel']);

// Production repository factory
const createInvitationRepository = (invitationModel: typeof InvitationRepository.prototype['invitationModel']) =>
    new InvitationRepository(invitationModel);

// User repository factory
const createUserRepository = (userModel: typeof UserRepository.prototype['userModel']) =>
    new UserRepository(userModel);

// Mock user repository factory for testing
const createMockUserRepository = () =>
    new UserRepository({
        findOne: () => ({ lean: async () => null }),
        find: () => ({ lean: async () => [] }),
        findOneAndUpdate: () => ({ lean: async () => null }),
        updateOne: async () => ({ modifiedCount: 0 }),
    } as unknown as typeof UserRepository.prototype['userModel']);

// DateValidator factory with specific format
const createDateValidator = () =>
    new DateValidator({
        format: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''
    });

@Module({
    imports: [
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forFeature([
                    { name: InvitationMongoModelName, schema: InvitationMongoSchema },
                    { name: UserMongoModelName, schema: UserMongoSchema },
                ]),
            ]),
    ],
    controllers: [InvitationController],
    providers: [
        {
            provide: 'InvitationRepository',
            useFactory:
                process.env.NODE_ENV === 'test'
                    ? createMockInvitationRepository
                    : createInvitationRepository,
            inject:
                process.env.NODE_ENV === 'test'
                    ? []
                    : [getModelToken(InvitationMongoModelName)],
        },
        {
            provide: UserRepository,
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
            provide: 'DateValidator',
            useFactory: createDateValidator,
        },
        CreateInvitationUseCase,
        ListInvitationsUseCase,
        GetInvitationByIdUseCase,
        UpdateInvitationUseCase,
        DeleteInvitationUseCase,
        UserContextMiddleware,
    ],
    exports: [
        'InvitationRepository',
        'DateValidator',
    ],
})
export class InvitationModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserContextMiddleware)
            .forRoutes('invitations');
    }
}
