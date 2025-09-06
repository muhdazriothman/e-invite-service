import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from '@user/infra/repository';
import { UserMongoModelName, UserMongoSchema } from '@user/infra/schema';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';

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
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'test-secret',
            signOptions: { expiresIn: '1h' },
        }),
    ],
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
        {
            provide: 'JwtService',
            useClass: JwtService,
        },
    ],
    exports: [
        'UserRepository',
        'HashService',
        'JwtService',
    ],
})
export class SharedModule { }
