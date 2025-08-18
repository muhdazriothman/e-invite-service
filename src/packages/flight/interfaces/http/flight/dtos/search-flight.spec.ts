import { validate } from 'class-validator';
import { SearchFlightDto } from '@flight/interfaces/http/flight/dtos/search-flight';

describe('@flight/interfaces/http/flight/dtos/search-flight', () => {
    let dto: SearchFlightDto;

    beforeEach(() => {
        dto = new SearchFlightDto();

        dto.departureDate = '2024-03-20';
        dto.returnDate = '2024-03-25';
        dto.origin = 'KUL';
        dto.originId = '1';
        dto.destination = 'SIN';
        dto.destinationId = '2';
    });

    describe('#validation', () => {
        it('should pass validation with valid data', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        describe('departureDate', () => {
            it('should fail validate when departureDate is not provided', async () => {
                // @ts-expect-error
                dto.departureDate = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('departureDate');
            });

            it('should fail validate when departureDate is not a string', async () => {
                // @ts-expect-error
                dto.departureDate = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('departureDate');
            });

            it('should fail validation when departureDate is empty', async () => {
                dto.departureDate = '';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('departureDate');
            });

            it('should fail validation when departureDate format is invalid', async () => {
                dto.departureDate = '20-03-2024';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('departureDate');
            });
        });

        describe('returnDate', () => {
            it('should fail validate when returnDate is not provided', async () => {
                // @ts-expect-error
                dto.returnDate = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('returnDate');
            });

            it('should fail validate when returnDate is not a string', async () => {
                // @ts-expect-error
                dto.returnDate = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('returnDate');
            });

            it('should fail validation when returnDate is empty', async () => {
                dto.returnDate = '';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('returnDate');
            });

            it('should fail validation when returnDate format is invalid', async () => {
                dto.returnDate = '20-03-2024';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('returnDate');
            });
        });

        describe('origin', () => {
            it('should fail validate when origin is not provided', async () => {
                // @ts-expect-error
                dto.origin = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('origin');
            });

            it('should fail validate when origin is not a string', async () => {
                // @ts-expect-error
                dto.origin = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('origin');
            });

            it('should fail validation when origin is empty', async () => {
                dto.origin = '';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('origin');
            });
        });

        describe('originId', () => {
            it('should fail validate when originId is not provided', async () => {
                // @ts-expect-error
                dto.originId = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('originId');
            });

            it('should fail validate when originId is not a string', async () => {
                // @ts-expect-error
                dto.originId = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('originId');
            });

            it('should fail validation when originId is empty', async () => {
                dto.originId = '';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('originId');
            });
        });

        describe('destination', () => {
            it('should fail validate when destination is not provided', async () => {
                // @ts-expect-error
                dto.destination = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('destination');
            });

            it('should fail validate when destination is not a string', async () => {
                // @ts-expect-error
                dto.destination = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('destination');
            });

            it('should fail validation when destination is empty', async () => {
                dto.destination = '';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('destination');
            });
        });

        describe('destinationId', () => {
            it('should fail validate when destinationId is not provided', async () => {
                // @ts-expect-error
                dto.destinationId = undefined;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('destinationId');
            });

            it('should fail validate when destinationId is not a string', async () => {
                // @ts-expect-error
                dto.destinationId = 1;

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('destinationId');
            });

            it('should fail validation when destinationId is empty', async () => {
                dto.destinationId = '';

                const errors = await validate(dto);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('destinationId');
            });
        });
    });
});