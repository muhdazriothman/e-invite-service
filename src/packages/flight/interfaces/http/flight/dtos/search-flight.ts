import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsDateFormat } from '@common/decorators/is-date-format';

export class SearchFlightDto {
    @IsString()
    @IsNotEmpty()
    @IsDateFormat('yyyy-MM-dd', {
        message: 'departureDate must be in YYYY-MM-DD format',
    })
    departureDate: string;

    @IsString()
    @IsNotEmpty()
    @IsDateFormat('yyyy-MM-dd', {
        message: 'returnDate must be in YYYY-MM-DD format',
    })
    returnDate: string;

    @IsString()
    @IsNotEmpty()
    origin: string;

    @IsString()
    @IsNotEmpty()
    originId: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsString()
    @IsNotEmpty()
    destinationId: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    weekendFlight?: string;
}
