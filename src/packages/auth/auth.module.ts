import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from '@auth/interfaces/http/controller';
import { JwtStrategy } from '@auth/interfaces/http/strategies/jwt';
import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';

import { LoginUseCase } from '@auth/application/use-cases/login';

import { SharedModule } from '@shared/shared.module';

@Module({
    imports: [
        ConfigModule,
        SharedModule,
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
        LoginUseCase,
    ],
    exports: [
        JwtAuthGuard,
        AdminAuthGuard,
    ],
})
export class AuthModule { }
