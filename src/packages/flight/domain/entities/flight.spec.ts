import { Flight, FlightProps } from '@flight/domain/entities/flight';

describe('@flight/domain/entities/flight', () => {
    let flight: Flight;
    let flightProps: FlightProps;

    beforeEach(() => {
        flightProps = {
            id: 'test-id',
            legs: [
                {
                    arrival: '2025-05-12',
                    departure: '2025-05-12',
                    originCode: 'LAX',
                    originName: 'Los Angeles',
                    destinationCode: 'SFO',
                    destinationName: 'San Francisco',
                    durationInMinutes: 120,
                    stopCount: 0,
                    segments: [
                        {
                            arrival: '2025-05-12',
                            departure: '2025-05-12',
                            originCode: 'LAX',
                            originName: 'Los Angeles',
                            destinationCode: 'SFO',
                            destinationName: 'San Francisco',
                            carrier: 'Delta',
                            flightNumber: '1234',
                        },
                    ],
                },
                {
                    arrival: '2025-05-12',
                    departure: '2025-05-12',
                    originCode: 'SFO',
                    originName: 'San Francisco',
                    destinationCode: 'LAX',
                    destinationName: 'Los Angeles',
                    durationInMinutes: 120,
                    stopCount: 0,
                    segments: [
                        {
                            arrival: '2025-05-12',
                            departure: '2025-05-12',
                            originCode: 'SFO',
                            originName: 'San Francisco',
                            destinationCode: 'LAX',
                            destinationName: 'Los Angeles',
                            carrier: 'Delta',
                            flightNumber: '1234',
                        },
                    ],
                },
            ],
            price: 100.1,
            priceFormatted: '$100',
            priceAfterDiscount: 90.09,
            priceAfterDiscountFormatted: '$91',
        };
    });

    describe('#constructor', () => {
        it('should create a Flight instance with provided props', () => {
            flight = new Flight(flightProps);

            expect(flight.id).toBe(flightProps.id);
            expect(flight.legs).toBe(flightProps.legs);
            expect(flight.price).toBe(flightProps.price);
            expect(flight.priceFormatted).toBe(flightProps.priceFormatted);
            expect(flight.priceAfterDiscount).toBe(flightProps.priceAfterDiscount);
            expect(flight.priceAfterDiscountFormatted).toBe(flightProps.priceAfterDiscountFormatted);
        });
    });

    describe('#applyDiscount', () => {
        it('should apply discount to the itinerary price and round up formatted price', () => {
            flight = new Flight(flightProps);

            flight.applyDiscount(0.10);

            expect(flight.priceAfterDiscount).toBe(90.09);
            expect(flight.priceAfterDiscountFormatted).toBe('$91');
        });

        it('should throw an error if discount rate is greater than 10%', () => {
            flight = new Flight(flightProps);

            expect(() => flight.applyDiscount(0.11)).toThrow('Discount rate cannot be greater than 10%');
        });
    });
});