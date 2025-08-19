import { Test, TestingModule } from '@nestjs/testing';

import { FlightController } from '@flight/interfaces/http/flight/controllers/flight';
import { SearchFlightUseCase } from '@flight/application/use-cases/search-flight';
import { FlightMapper } from '@flight/interfaces/http/flight/mappers/flight';
import { createMock } from '@test/utils/mocks';

import { FlightFixture } from '@test/fixture/flight';
import { Flight } from '@flight/domain/entities/flight';

describe('@flight/interfaces/http/flight/controllers/flight', () => {
    let flightController: FlightController;
    let searchFlightUseCase: jest.Mocked<SearchFlightUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FlightController],
            providers: [
                {
                    provide: SearchFlightUseCase,
                    useValue: createMock<SearchFlightUseCase>(),
                },
            ],
        }).compile();

        flightController = module.get<FlightController>(FlightController);
        searchFlightUseCase = module.get<SearchFlightUseCase>(
            SearchFlightUseCase,
        ) as jest.Mocked<SearchFlightUseCase>;
    });

    it('should be defined', () => {
        expect(flightController).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    let toListDtoSpy: jest.SpyInstance;

    const flights: Flight[] = [FlightFixture.getFlightEntity({})];

    describe('#searchFlight', () => {
        beforeEach(() => {
            toListDtoSpy = jest.spyOn(FlightMapper, 'toListDto');
        });

        it('should call searchFlightUseCase.execute with query params and return formatted response', async () => {
            const query = {
                departureDate: '2024-03-20',
                returnDate: '2024-03-25',
                origin: 'KUL',
                originId: '1',
                destination: 'SIN',
                destinationId: '2',
            };

            searchFlightUseCase.execute.mockResolvedValue(flights);

            const result = await flightController.searchFlight(query);

            expect(searchFlightUseCase.execute).toHaveBeenCalledWith(query);
            expect(toListDtoSpy).toHaveBeenCalledWith(flights);

            const mappedFlights = toListDtoSpy.mock.results[0].value;
            const expectedResponse = {
                statusCode: 200,
                data: mappedFlights,
            };

            expect(result).toEqual(expectedResponse);
        });
    });
});
