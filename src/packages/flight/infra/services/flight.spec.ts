import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

import { FlightServiceImpl } from './flight';
import { FlightMapper } from '../mappers/flight-mapper';
import { Flight } from '@flight/domain/entities/flight';

describe('@flight/infra/services/flight', () => {
    let service: FlightServiceImpl;
    let httpService: jest.Mocked<HttpService>;
    let configService: jest.Mocked<ConfigService>;
    let flightMapper: jest.Mocked<FlightMapper>;

    beforeEach(async () => {
        const httpServiceMock = {
            get: jest.fn()
        };

        const configServiceMock = {
            get: jest.fn().mockImplementation((key: string) => {
                if (key === 'RAPID_API_KEY') {
                    return 'test-api-key';
                }
                return null;
            })
        };

        const flightMapperMock = {
            mapToFlight: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlightServiceImpl,
                { provide: HttpService, useValue: httpServiceMock },
                { provide: ConfigService, useValue: configServiceMock },
                { provide: FlightMapper, useValue: flightMapperMock }
            ],
        }).compile();

        service = module.get<FlightServiceImpl>(FlightServiceImpl);
        httpService = module.get(HttpService) as jest.Mocked<HttpService>;
        configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
        flightMapper = module.get(FlightMapper) as jest.Mocked<FlightMapper>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('#searchFlight', () => {
        const searchParams = {
            departureDate: '2025-05-15',
            returnDate: '2025-05-27',
            origin: 'KUL',
            originId: '1',
            destination: 'SIN',
            destinationId: '2'
        };

        it('should return flights when API call is successful', async () => {
            const mockApiResponse: any = {
                data: {
                    itineraries: {
                        buckets: [
                            {
                                items: [
                                    {
                                        id: 'flight-1',
                                        price: { raw: 200, formatted: '$200' },
                                        legs: []
                                    },
                                    {
                                        id: 'flight-2',
                                        price: { raw: 300, formatted: '$300' },
                                        legs: []
                                    }
                                ]
                            }
                        ]
                    }
                },
                status: 'success',
                token: 'mock-token'
            };

            const mockFlights = [
                new Flight({ id: 'flight-1', price: 200, priceFormatted: '$200', priceAfterDiscount: 200, priceAfterDiscountFormatted: '$200', legs: [] }),
                new Flight({ id: 'flight-2', price: 300, priceFormatted: '$300', priceAfterDiscount: 300, priceAfterDiscountFormatted: '$300', legs: [] })
            ];

            httpService.get.mockReturnValue(of({
                data: mockApiResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: { url: 'test' }
            } as AxiosResponse));

            flightMapper.mapToFlight.mockImplementation((item) => {
                if (item.id === 'flight-1') return mockFlights[0];
                return mockFlights[1];
            });

            const result = await service.searchFlight(searchParams);

            expect(httpService.get).toHaveBeenCalledWith(
                'https://skyscanner89.p.rapidapi.com/flights/roundtrip/list',
                expect.objectContaining({
                    params: {
                        inDate: searchParams.departureDate,
                        outDate: searchParams.returnDate,
                        origin: searchParams.origin,
                        originId: searchParams.originId,
                        destination: searchParams.destination,
                        destinationId: searchParams.destinationId
                    },
                    headers: {
                        'x-rapidapi-host': 'skyscanner89.p.rapidapi.com',
                        'X-RapidAPI-Key': 'test-api-key'
                    }
                })
            );
            expect(flightMapper.mapToFlight).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockFlights);
        });

        it('should return empty array when API response has no items', async () => {
            const mockApiResponse = {
                data: {
                    data: {
                        itineraries: {
                            buckets: [{ items: [] }]
                        }
                    }
                }
            };

            httpService.get.mockReturnValue(of({
                data: mockApiResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: { url: 'test' }
            } as AxiosResponse));

            const result = await service.searchFlight(searchParams);

            expect(result).toEqual([]);
            expect(flightMapper.mapToFlight).not.toHaveBeenCalled();
        });

        it('should handle errors from the API by throwing an exception', async () => {
            httpService.get.mockReturnValue(throwError(() => new Error('API error')));

            await expect(service.searchFlight(searchParams)).rejects.toThrow('Failed to search flights: API error');
        });
    });
});