import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { InvitationModule } from '@invitation/invitation.module';
import {
    ConfigModule,
    ConfigService,
} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            ...(process.env.NODE_ENV !== 'test' && {
                validationSchema: Joi.object({
                    JWT_SECRET: Joi.string().required(),
                    MONGODB_URI: Joi.string().uri().required(),
                    PORT: Joi.number().default(3000),
                }),
            }),
        }),
        ...(process.env.NODE_ENV === 'test'
            ? []
            : [
                MongooseModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: async (config: ConfigService) => ({
                        uri:
                            config.get<string>('MONGODB_URI') ||
                            'mongodb://localhost:55000/einvite',
                    }),
                }),
            ]),
        AuthModule,
        UserModule,
        InvitationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
