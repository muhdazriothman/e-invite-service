import { FlightSearchParams, FlightService } from '@flight/domain/services/flight';

import { Flight, FlightProps } from '@flight/domain/entities/flight';

describe('@flight/domain/services/flight', () => {
    let flightService: FlightService;

    beforeEach(() => {
        flightService = {
            searchFlight: jest.fn()
        };
    });

    describe('#searchFlight', () => {
        it('should return Flight data', async () => {
            const searchParams: FlightSearchParams = {
                departureDate: '01-01-2024',
                returnDate: '02-01-2024',
                origin: 'KUL',
                originId: 'KUL123',
                destination: 'SIN',
                destinationId: 'SIN456',
            };

            const flightProps: FlightProps = {
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
                    }
                ],
                price: 100.1,
                priceFormatted: '$100',
                priceAfterDiscount: 90.09,
                priceAfterDiscountFormatted: '$91',
            };

            const flight = new Flight(flightProps);
            jest.spyOn(flightService, 'searchFlight').mockResolvedValue([flight]);

            const result = await flightService.searchFlight(searchParams);

            expect(result).toBeInstanceOf(Array);
            expect(result[0]).toBeInstanceOf(Flight);
            expect(flightService.searchFlight).toHaveBeenNthCalledWith(1, searchParams);
        });

        it('should throw an error when search fails', async () => {
            const searchParams: FlightSearchParams = {
                departureDate: '01-01-2024',
                returnDate: '02-01-2024',
                origin: 'KUL',
                originId: 'KUL123',
                destination: 'SIN',
                destinationId: 'SIN456',
            };

            const error = new Error('Search failed');
            jest.spyOn(flightService, 'searchFlight').mockRejectedValue(error);

            await expect(flightService.searchFlight(searchParams)).rejects.toThrow('Search failed');
            expect(flightService.searchFlight).toHaveBeenNthCalledWith(1, searchParams);
        });
    });
});
