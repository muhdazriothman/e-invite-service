import { Test } from '@nestjs/testing';
import { FlightModule } from '@modules/flight';
import { FlightController } from '@flight/interfaces/http/flight/controllers/flight';
import { SearchFlightUseCase } from '@flight/application/use-cases/search-flight';
import { FlightServiceImpl } from '@flight/infra/services/flight';
import { HttpModule } from '@nestjs/axios';

describe('@modules/flight', () => {
    let moduleRef: any;

    beforeEach(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [FlightModule],
        }).compile();
    });

    it('should be defined', () => {
        expect(moduleRef).toBeDefined();
    });

    describe('imports', () => {
        it('should have HttpModule import', () => {
            const metadata = Reflect.getMetadata('imports', FlightModule);
            const hasHttpModule = metadata.some((mod: any) => mod === HttpModule);
            expect(hasHttpModule).toBe(true);
        });
    });

    it('should have FlightController', () => {
        const controller = moduleRef.get(FlightController);
        expect(controller).toBeDefined();
    });

    it('should have SearchFlightUseCase', () => {
        const useCase = moduleRef.get(SearchFlightUseCase);
        expect(useCase).toBeDefined();
    });

    it('should have FlightServiceImpl as FlightService', () => {
        const service = moduleRef.get('FlightService');
        expect(service).toBeInstanceOf(FlightServiceImpl);
    });
});