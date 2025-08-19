import { Module } from '@nestjs/common';
import { FlightModule } from '@modules/flight';
import { AuthModule } from '@modules/auth';
import {
    ConfigModule, ConfigService
} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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
        FlightModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
