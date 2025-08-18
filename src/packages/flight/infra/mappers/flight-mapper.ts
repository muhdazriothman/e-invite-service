import { Injectable } from '@nestjs/common';
import { Flight, FlightLeg, FlightSegment } from '@flight/domain/entities/flight';

import { Item, Leg, Segment } from '@flight/infra/api/search-flight-response';

@Injectable()
export class FlightMapper {
    mapToFlight(item: Item): Flight {
        const flight = new Flight({
            id: item.id,
            legs: [],
            price: item.price.raw,
            priceFormatted: item.price.formatted,
            priceAfterDiscount: item.price.raw,
            priceAfterDiscountFormatted: item.price.formatted,
        });

        for (const leg of item.legs) {
            const flightLeg = this.mapToFlightLeg(leg);
            flight.legs.push(flightLeg);
        }

        return flight;
    }

    private mapToFlightLeg(leg: Leg): FlightLeg {
        const flightLeg: FlightLeg = {
            arrival: leg.arrival,
            departure: leg.departure,
            originCode: leg.origin.id,
            originName: leg.origin.name,
            destinationCode: leg.destination.id,
            destinationName: leg.destination.name,
            durationInMinutes: leg.durationInMinutes,
            stopCount: leg.stopCount,
            segments: [],
        };

        for (const segment of leg.segments) {
            const flightSegment = this.mapToFlightSegment(segment);
            flightLeg.segments.push(flightSegment);
        }

        return flightLeg;
    }

    private mapToFlightSegment(segment: Segment): FlightSegment {
        return {
            arrival: segment.arrival,
            departure: segment.departure,
            originCode: segment.origin.displayCode,
            originName: segment.origin.name,
            destinationCode: segment.destination.displayCode,
            destinationName: segment.destination.name,
            carrier: segment.operatingCarrier.name,
            flightNumber: segment.flightNumber,
        };
    }
}