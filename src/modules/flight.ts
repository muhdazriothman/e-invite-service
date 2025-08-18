import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { FlightController } from '@flight/interfaces/http/flight/controllers/flight';
import { SearchFlightUseCase } from '@flight/application/use-cases/search-flight';
import { FlightServiceImpl } from '@flight/infra/services/flight';
import { FlightMapper } from '@flight/infra/mappers/flight-mapper';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
    ],
    controllers: [FlightController],
    providers: [
        SearchFlightUseCase,
        FlightMapper,
        {
            provide: 'FlightService',
            useClass: FlightServiceImpl
        },
    ]
})
export class FlightModule { }