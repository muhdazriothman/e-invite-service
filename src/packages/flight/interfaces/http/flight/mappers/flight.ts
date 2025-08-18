import { Flight, FlightLeg, FlightSegment } from "@flight/domain/entities/flight";

export interface FlighDto {
    id: string;
    legs: FlightLegDto[];
    price: number;
    priceFormatted: string;
    priceAfterDiscount: number;
    priceAfterDiscountFormatted: string;
}

export interface FlightLegDto {
    arrival: string;
    departure: string;
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    durationInMinutes: number;
    stopCount: number;
    segments: FlightSegmentDto[];
}

export interface FlightSegmentDto {
    arrival: string;
    departure: string;
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    carrier: string;
    flightNumber: string;
}

export class FlightMapper {
    static toFlightDto(flight: Flight): FlighDto {
        const flightResponse = {
            id: flight.id,
            price: flight.price,
            priceFormatted: flight.priceFormatted,
            priceAfterDiscount: flight.priceAfterDiscount,
            priceAfterDiscountFormatted: flight.priceAfterDiscountFormatted,
            legs: [] as FlightLegDto[]
        };

        for (const leg of flight.legs) {
            flightResponse.legs.push(FlightMapper.toFlightLegDto(leg));
        }

        return flightResponse;
    }

    static toListDto(flights: Flight[]): FlighDto[] {
        return flights.map(flight => this.toFlightDto(flight));
    }

    static toFlightLegDto(leg: FlightLeg): FlightLegDto {
        const legResponse = {
            arrival: leg.arrival,
            departure: leg.departure,
            originCode: leg.originCode,
            originName: leg.originName,
            destinationCode: leg.destinationCode,
            destinationName: leg.destinationName,
            durationInMinutes: leg.durationInMinutes,
            stopCount: leg.stopCount,
            segments: [] as FlightSegmentDto[]
        };

        for (const segment of leg.segments) {
            const segmentResponse = FlightMapper.toFlightSegmentDto(segment);
            legResponse.segments.push(segmentResponse);
        }

        return legResponse;
    }

    static toFlightSegmentDto(segment: FlightSegment): FlightSegmentDto {
        return {
            arrival: segment.arrival,
            departure: segment.departure,
            originCode: segment.originCode,
            originName: segment.originName,
            destinationCode: segment.destinationCode,
            destinationName: segment.destinationName,
            carrier: segment.carrier,
            flightNumber: segment.flightNumber
        };
    }
}