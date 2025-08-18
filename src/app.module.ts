import { Module } from '@nestjs/common';
import { FlightModule } from '@modules/flight';
import { AuthModule } from '@modules/auth';

@Module({
    imports: [FlightModule, AuthModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
