import { LoginUseCase } from '@auth/application/use-cases/login';
import { AuthController } from '@auth/interfaces/http/controller';
import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';
import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { JwtStrategy } from '@auth/interfaces/http/strategies/jwt';
import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [
    ConfigModule,
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async(configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, AdminAuthGuard, LoginUseCase],
  exports: [JwtAuthGuard, AdminAuthGuard],
})
export class AuthModule {}
