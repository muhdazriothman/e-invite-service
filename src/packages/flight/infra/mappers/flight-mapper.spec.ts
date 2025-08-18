import { FlightMapper } from '@flight/infra/mappers/flight-mapper';
import { Flight } from '@flight/domain/entities/flight';
import { Item } from '../api/search-flight-response';

describe('@flight/infra/mappers/flight-mapper', () => {
    let flightMapper: FlightMapper;

    beforeEach(() => {
        flightMapper = new FlightMapper();
    });

    describe('#mapToFlight', () => {
        it('should correctly map API response to Flight entity', () => {
            const mockApiItem = {
                id: 'test-flight-id',
                price: {
                    raw: 200,
                    formatted: '$200'
                },
                legs: [
                    {
                        arrival: '2025-05-18T15:30:00',
                        departure: '2025-05-18T09:15:00',
                        origin: {
                            id: 'KUL',
                            name: 'Kuala Lumpur'
                        },
                        destination: {
                            id: 'SIN',
                            name: 'Singapore'
                        },
                        durationInMinutes: 135,
                        stopCount: 0,
                        segments: [
                            {
                                arrival: '2025-05-18T15:30:00',
                                departure: '2025-05-18T09:15:00',
                                origin: {
                                    displayCode: 'KUL',
                                    name: 'Kuala Lumpur'
                                },
                                destination: {
                                    displayCode: 'SIN',
                                    name: 'Singapore'
                                },
                                operatingCarrier: {
                                    name: 'Malaysia Airlines'
                                },
                                flightNumber: 'MH123'
                            }
                        ]
                    }
                ]
            };

            const result = flightMapper.mapToFlight(mockApiItem as Item);

            expect(result).toBeInstanceOf(Flight);
            expect(result.id).toBe('test-flight-id');
            expect(result.price).toBe(200);
            expect(result.priceFormatted).toBe('$200');
            expect(result.priceAfterDiscount).toBe(200);
            expect(result.priceAfterDiscountFormatted).toBe('$200');

            expect(result.legs.length).toBe(1);

            const leg = result.legs[0];
            expect(leg.arrival).toBe('2025-05-18T15:30:00');
            expect(leg.departure).toBe('2025-05-18T09:15:00');
            expect(leg.originCode).toBe('KUL');
            expect(leg.originName).toBe('Kuala Lumpur');
            expect(leg.destinationCode).toBe('SIN');
            expect(leg.destinationName).toBe('Singapore');
            expect(leg.durationInMinutes).toBe(135);
            expect(leg.stopCount).toBe(0);

            expect(leg.segments.length).toBe(1);

            const segment = leg.segments[0];
            expect(segment.arrival).toBe('2025-05-18T15:30:00');
            expect(segment.departure).toBe('2025-05-18T09:15:00');
            expect(segment.originCode).toBe('KUL');
            expect(segment.originName).toBe('Kuala Lumpur');
            expect(segment.destinationCode).toBe('SIN');
            expect(segment.destinationName).toBe('Singapore');
            expect(segment.carrier).toBe('Malaysia Airlines');
            expect(segment.flightNumber).toBe('MH123');
        });
    });
});