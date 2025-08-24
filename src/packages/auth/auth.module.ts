import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { AuthController } from '@auth/interfaces/http/controller';
import { JwtStrategy } from '@auth/interfaces/http/strategies/jwt';
import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';

import { LoginUseCase } from '@auth/application/use-cases/login';

import { JwtService } from '@common/services/jwt';
import { HashService } from '@common/services/hash';
import { UserRepository } from '@user/infra/repository';
import { UserMongoModelName, UserMongoSchema } from '@user/infra/schema';

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
        ConfigModule,
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forFeature([
                    { name: UserMongoModelName, schema: UserMongoSchema },
                ]),
            ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        JwtStrategy,
        JwtAuthGuard,
        AdminAuthGuard,
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
            provide: 'JwtService',
            useClass: JwtService,
        },
        {
            provide: 'HashService',
            useClass: HashService,
        },
        LoginUseCase,
    ],
    exports: [
        'JwtService',
        'HashService',
        'UserRepository',
        JwtAuthGuard,
        AdminAuthGuard,
    ],
})
export class AuthModule { }
