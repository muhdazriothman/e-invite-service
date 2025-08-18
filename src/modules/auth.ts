import { Module } from '@nestjs/common';
import { AuthController } from '@user/interfaces/http/controllers/auth';
import { JwtStrategy } from '@user/interfaces/http/strategies/jwt';
import { JwtAuthGuard } from '@user/interfaces/http/guards/jwt-auth';
import { JwtServiceImpl } from '@user/infra/services/jwt';
import { HashServiceImpl } from '@user/infra/services/hash';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoginUseCase } from '@user/application/use-cases/login';
import { UserRepositoryImpl } from '@user/infra/repositories/user';

@Module({
    imports: [
        ConfigModule,
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
            useClass: UserRepositoryImpl,
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
    ],
    exports: ['JwtService', 'HashService', 'UserRepository'],
})
export class AuthModule { }
