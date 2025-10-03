import { AuthModule } from '@auth/auth.module';
import { InvitationModule } from '@invitation/invitation.module';
import { Module } from '@nestjs/common';
import {
    ConfigModule,
    ConfigService,
} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from '@payment/payment.module';
import { UserModule } from '@user/user.module';
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                JWT_SECRET: Joi.string().required(),
                MONGODB_URI: Joi.string().uri().required(),
                PORT: Joi.number().default(3000),
            }),
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI') || 'mongodb://localhost:55000/einvite',
            }),
        }),
        AuthModule,
        UserModule,
        InvitationModule,
        PaymentModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
