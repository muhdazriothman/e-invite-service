import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { InvitationController } from '@invitation/interfaces/http/controller';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { InvitationRepository } from '@invitation/infra/repository';
import { InvitationMongoModelName, InvitationMongoSchema } from '@invitation/infra/schema';
import { DateValidator } from '@common/utils/date';

// Mock factory for testing
const createMockInvitationRepository = () =>
    new InvitationRepository({
        create: async (invitation: any) => ({
            id: 'test',
            ...invitation,
        }),
        findOne: () => ({ lean: async () => null }),
        find: () => ({ lean: async () => [] }),
        findOneAndUpdate: () => ({ lean: async () => null }),
        updateOne: async () => ({ modifiedCount: 0 }),
    } as any);

// Production repository factory
const createInvitationRepository = (invitationModel: any) =>
    new InvitationRepository(invitationModel);

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
            provide: 'DateValidator',
            useFactory: createDateValidator,
        },
        CreateInvitationUseCase,
        ListInvitationsUseCase,
        GetInvitationByIdUseCase,
        UpdateInvitationUseCase,
        DeleteInvitationUseCase,
    ],
    exports: [
        'InvitationRepository',
        'DateValidator',
    ],
})
export class InvitationModule { }
