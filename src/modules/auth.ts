import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { AuthController } from '@user/interfaces/http/controllers/auth';
import { JwtStrategy } from '@user/interfaces/http/strategies/jwt';
import { JwtAuthGuard } from '@user/interfaces/http/guards/jwt-auth';

import { LoginUseCase } from '@user/application/use-cases/login';
import { RegisterUseCase } from '@user/application/use-cases/register';

import { JwtServiceImpl } from '@user/infra/services/jwt';
import { HashServiceImpl } from '@user/infra/services/hash';
import { UserRepositoryImpl } from '@user/infra/repositories/user';
import { UserMongoModelName, UserMongoSchema } from '@user/infra/schemas/user';

// Mock factory for testing
const createMockUserRepository = () =>
  new UserRepositoryImpl({
    findOne: () => ({ lean: async () => null }),
    create: async (user: any) => ({
      toObject: () => ({ _id: 'test', ...user }),
    }),
  } as any);

// Production repository factory
const createUserRepository = (userModel: any) =>
  new UserRepositoryImpl(userModel);

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
      useClass: JwtServiceImpl,
    },
    {
      provide: 'HashService',
      useClass: HashServiceImpl,
    },
    LoginUseCase,
    RegisterUseCase,
  ],
  exports: ['JwtService', 'HashService', 'UserRepository'],
})
export class AuthModule {}
