import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsString,
    IsPhoneNumber,
    IsOptional,
    IsUrl,
    MinLength,
    ValidateNested,
    ArrayMinSize
} from 'class-validator';

import { IsDate } from '../../../../common/infra/data-transformer/date';

export class CreateInvitationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
        title!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
        groomsName!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
        bridesName!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
        firstHostName!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
        secondHostName!: string;

    @ValidateNested()
    @Type(() => WeddingDateDto)
        weddingDate!: WeddingDateDto;

    @ValidateNested()
    @Type(() => WeddingLocationDto)
        weddingLocation!: WeddingLocationDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItineraryDto)
    @ArrayMinSize(1)
        itinerary!: ItineraryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactPersonDto)
    @ArrayMinSize(1)
        contactPersons!: ContactPersonDto[];
}

class WeddingDateDto {
    @IsDate()
    @IsNotEmpty()
        gregorionDate!: Date;

    @IsString()
    @IsOptional()
        hijriDate?: string | null;
}

class WeddingLocationDto {
    @IsString()
    @IsNotEmpty()
        address!: string;

    @IsString()
    @IsOptional()
    @IsUrl()
        wazeLink?: string | null;

    @IsString()
    @IsOptional()
    @IsUrl()
        googleMapsLink?: string | null;
}

class ItineraryDto {
    @IsString()
    @IsNotEmpty()
        activity!: string;

    @IsDate()
    @IsNotEmpty()
        startTime!: Date;

    @IsDate()
    @IsNotEmpty()
        endTime!: Date;
}

class ContactPersonDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
        name!: string;

    @IsString()
    @IsPhoneNumber()
    @IsOptional()
        phoneNumber?: string | null;

    @IsString()
    @IsPhoneNumber()
    @IsOptional()
        whatsappNumber?: string | null;
}
