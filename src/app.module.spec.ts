import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { FlightModule } from '@modules/flight';

describe('AppModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    describe('imports', () => {
        it('should have FlightModule', () => {
            const metadata = Reflect.getMetadata('imports', AppModule);
            expect(metadata).toContain(FlightModule);
        });
    });

    describe('controllers', () => {
        it('should have empty Controller', () => {
            const controllers = Reflect.getMetadata('controllers', AppModule);
            expect(controllers).toEqual([]);
        });
    });

    describe('providers', () => {
        it('should have empty Providers', () => {
            const providers = Reflect.getMetadata('providers', AppModule);
            expect(providers).toEqual([]);
        });
    });
});