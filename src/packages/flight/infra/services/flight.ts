import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { Flight } from '@flight/domain/entities/flight';
import { FlightService, FlightSearchParams } from '@flight/domain/services/flight';
import { SearchFlightResponse } from '../api/search-flight-response';
import { FlightMapper } from '@flight/infra/mappers/flight-mapper';

@Injectable()
export class FlightServiceImpl implements FlightService {
    private readonly apiKey: string;
    private readonly apiHost: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly flightMapper: FlightMapper
    ) {
        this.apiHost = 'skyscanner89.p.rapidapi.com';
        const apiKey = this.configService.get<string>('RAPID_API_KEY');
        if (!apiKey) {
            throw new Error('RAPID_API_KEY environment variable is not set');
        }
        this.apiKey = apiKey;
    }

    async searchFlight(params: FlightSearchParams): Promise<Flight[]> {
        try {
            const response = await this.fetchFlightFromSkyscanner(params);
            return this.processFlightResponse(response);
        } catch (error) {
            console.error('Flight API error:', error);
            throw new Error(`Failed to search flights: ${error.message}`);
        }
    }

    private async fetchFlightFromSkyscanner(params: FlightSearchParams): Promise<SearchFlightResponse> {
        const apiUrl = 'https://skyscanner89.p.rapidapi.com/flights/roundtrip/list';

        const options = {
            params: {
                inDate: params.departureDate,
                outDate: params.returnDate,
                origin: params.origin,
                originId: params.originId,
                destination: params.destination,
                destinationId: params.destinationId
            },
            headers: {
                'x-rapidapi-host': this.apiHost,
                'X-RapidAPI-Key': this.apiKey
            }
        };

        const { data } = await firstValueFrom(
            this.httpService.get<SearchFlightResponse>(apiUrl, options)
        );

        return data;
    }

    processFlightResponse(response: SearchFlightResponse): Flight[] {
        if (!response?.data?.itineraries?.buckets?.[0]?.items) {
            return [];
        }

        const flightIdSet: Set<string> = new Set();
        const flights: Flight[] = [];

        for (const item of response.data.itineraries.buckets[0].items) {
            if (flightIdSet.has(item.id)) {
                continue;
            }

            flightIdSet.add(item.id);
            const flight = this.flightMapper.mapToFlight(item);
            flights.push(flight);
        }

        return flights;
    }
}