import { LoginUseCase } from '@auth/application/use-cases/login';
import { AuthController } from '@auth/interfaces/http/controller';
import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';
import { BasicAuthGuard } from '@auth/interfaces/http/guards/basic-auth';
import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { JwtStrategy } from '@auth/interfaces/http/strategies/jwt';
import { Module } from '@nestjs/common';
import {
    ConfigModule,
    ConfigService,
} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
    MongooseModule,
    getModelToken,
} from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
import { UserAuthService } from '@user/application/services/user-auth.service';
import { UserRepository } from '@user/infra/repository';
import {
    UserMongoDocument,
    UserMongoModelName,
    UserMongoSchema,
} from '@user/infra/schema';
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
        ConfigModule,
        SharedModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
            inject: [ConfigService],
        }),
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forFeature([
                    { name: UserMongoModelName, schema: UserMongoSchema },
                ]),
            ]),
    ],
    controllers: [AuthController],
    providers: [
        JwtStrategy,
        JwtAuthGuard,
        AdminAuthGuard,
        BasicAuthGuard,
        LoginUseCase,
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
            provide: 'UserAuthService',
            useClass: UserAuthService,
        },
    ],
    exports: [JwtAuthGuard, AdminAuthGuard, BasicAuthGuard, 'UserAuthService'],
})
export class AuthModule {}
