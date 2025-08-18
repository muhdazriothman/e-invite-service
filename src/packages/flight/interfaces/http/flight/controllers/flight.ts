import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@user/interfaces/http/guards/jwt-auth';
import { SearchFlightDto } from '@flight/interfaces/http/flight/dtos/search-flight';
import { SearchFlightUseCase } from '@flight/application/use-cases/search-flight';
import { FlightMapper } from '@flight/interfaces/http/flight/mappers/flight';

@Controller('flight')
export class FlightController {
    constructor(
        private readonly searchFlightUseCase: SearchFlightUseCase,
    ) { }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async searchFlight(@Query() query: SearchFlightDto) {
        const flights = await this.searchFlightUseCase.execute(query);
        return {
            statusCode: 200,
            data: FlightMapper.toListDto(flights),
        };
    }
}