import { Flight, FlightLeg, FlightSegment } from '@flight/domain/entities/flight';
import { FlightMapper } from '@flight/interfaces/http/flight/mappers/flight';
import { FlightFixture } from 'test/fixture/flight';

describe('@flight/interfaces/http/flight/mappers/flight', () => {
    let flight: Flight;
    let flightLeg: FlightLeg;
    let flightSegment: FlightSegment;

    beforeEach(() => {
        flight = FlightFixture.getFlightEntity({});
        flightLeg = flight.legs[0];
        flightSegment = flightLeg.segments[0];
    });

    describe('#toFlightDto', () => {
        it('should map Flight entity to FlightDto', () => {
            const result = FlightMapper.toFlightDto(flight);

            expect(result).toBeDefined();
            expect(result.id).toBe(flight.id);
            expect(result.price).toBe(flight.price);
            expect(result.priceFormatted).toBe(flight.priceFormatted);
            expect(result.priceAfterDiscount).toBe(flight.priceAfterDiscount);
            expect(result.priceAfterDiscountFormatted).toBe(flight.priceAfterDiscountFormatted);
            expect(result.legs).toHaveLength(flight.legs.length);
        });
    });

    describe('#toListDto', () => {
        it('should map an array of Flight entities to FlightDto array', () => {
            const flights = [
                flight,
                FlightFixture.getFlightEntity({ id: 'second-flight' })
            ];

            const result = FlightMapper.toListDto(flights);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(flights[0].id);
            expect(result[1].id).toBe(flights[1].id);
        });

        it('should return empty array when input is empty', () => {
            const result = FlightMapper.toListDto([]);

            expect(result).toEqual([]);
        });
    });

    describe('#toFlightLegDto', () => {
        it('should map FlightLeg to FlightLegDto', () => {
            const result = FlightMapper.toFlightLegDto(flightLeg);

            expect(result).toBeDefined();
            expect(result.arrival).toBe(flightLeg.arrival);
            expect(result.departure).toBe(flightLeg.departure);
            expect(result.originCode).toBe(flightLeg.originCode);
            expect(result.originName).toBe(flightLeg.originName);
            expect(result.destinationCode).toBe(flightLeg.destinationCode);
            expect(result.destinationName).toBe(flightLeg.destinationName);
            expect(result.durationInMinutes).toBe(flightLeg.durationInMinutes);
            expect(result.stopCount).toBe(flightLeg.stopCount);
            expect(result.segments).toHaveLength(flightLeg.segments.length);
        });
    });

    describe('#toFlightSegmentDto', () => {
        it('should map FlightSegment to FlightSegmentDto', () => {
            const result = FlightMapper.toFlightSegmentDto(flightSegment);

            expect(result).toBeDefined();
            expect(result.arrival).toBe(flightSegment.arrival);
            expect(result.departure).toBe(flightSegment.departure);
            expect(result.originCode).toBe(flightSegment.originCode);
            expect(result.originName).toBe(flightSegment.originName);
            expect(result.destinationCode).toBe(flightSegment.destinationCode);
            expect(result.destinationName).toBe(flightSegment.destinationName);
            expect(result.carrier).toBe(flightSegment.carrier);
            expect(result.flightNumber).toBe(flightSegment.flightNumber);
        });
    });
});