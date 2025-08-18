import { Injectable, Inject, BadRequestException, BadGatewayException } from '@nestjs/common';

import { DateTime } from 'luxon';

import { Flight } from '@flight/domain/entities/flight';
import { FlightService } from '@flight/domain/services/flight';
import { SearchFlightDto } from '@flight/interfaces/http/flight/dtos/search-flight';

import { DateValidator } from '@common/utils/date';

export interface ValidateDateParams {
    departureDate: DateTime;
    returnDate: DateTime;
}

export interface ShouldApplyDiscountParams {
    departureDate: DateTime;
    returnDate: DateTime;
}

@Injectable()
export class SearchFlightUseCase {
    constructor(
        @Inject('FlightService')
        private readonly flightService: FlightService
    ) { }

    async execute(query: SearchFlightDto) {
        const parsedDepartureDate = DateValidator.parseDate(query.departureDate, 'yyyy-MM-dd');
        const parsedReturnDate = DateValidator.parseDate(query.returnDate, 'yyyy-MM-dd');

        SearchFlightUseCase.validateDate({
            departureDate: parsedDepartureDate,
            returnDate: parsedReturnDate
        });

        let flights: Flight[] = [];

        try {
            flights = await this.flightService.searchFlight({
                departureDate: query.departureDate,
                returnDate: query.returnDate,
                origin: query.origin,
                originId: query.originId,
                destination: query.destination,
                destinationId: query.destinationId
            });
        } catch (error) {
            throw new BadGatewayException('Flight data service is not available');
        }

        const shouldApplyDiscount = SearchFlightUseCase.shouldApplyDiscount({
            departureDate: parsedDepartureDate,
            returnDate: parsedReturnDate
        });

        if (shouldApplyDiscount) {
            for (const flight of flights) {
                flight.applyDiscount(0.10);
            }
        }

        return SearchFlightUseCase.sortFlightData(flights, {
            sortBy: 'asc'
        });
    }

    static validateDate(params: ValidateDateParams) {
        const {
            departureDate,
            returnDate
        } = params;

        if (DateValidator.isPastDate(departureDate)) {
            throw new BadRequestException('departureDate must be in the future');
        }

        if (DateValidator.isPastDate(returnDate)) {
            throw new BadRequestException('returnDate must be in the future');
        }

        if (DateValidator.isBeforeDate({
            targetDate: returnDate,
            referenceDate: departureDate,
        })) {
            throw new BadRequestException('returnDate must be after departureDate');
        }
    }

    static sortFlightData(flights: Flight[], options: {
        sortBy: 'asc' | 'desc';
    } = {
            sortBy: 'asc'
        }) {
        const sortedFlights = flights.sort((a, b) => {
            if (options.sortBy === 'asc') {
                return a.priceAfterDiscount - b.priceAfterDiscount;
            }

            return b.priceAfterDiscount - a.priceAfterDiscount;
        });

        return sortedFlights;
    }

    static shouldApplyDiscount(params: ShouldApplyDiscountParams): boolean {
        const {
            departureDate,
            returnDate
        } = params;

        const daysBetweenDates = DateValidator.getDaysBetweenDates({
            firstDate: departureDate,
            secondDate: returnDate,
        });

        if (daysBetweenDates > 10) {
            return true;
        }

        return false;
    }
}