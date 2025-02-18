import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    ArrayNotEmpty,
    IsArray,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
    ValidateNested
} from 'class-validator';
import { IsDate } from '../../../../common/infra/data-transformer/date';
import {
    CelebratedPersonType,
    InvitationType
} from '../../../domain/entities/invitation';

export class CreateInvitationDto {
    @IsEnum(InvitationType)
    @IsNotEmpty()
    type!: InvitationType;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    title!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HostDto)
    @ArrayMinSize(1)
    hosts!: HostDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CelebratedPersonDto)
    @ArrayMinSize(1)
    celebratedPersons!: CelebratedPersonDto[];

    @ValidateNested()
    @Type(() => EventDateDto)
    date!: EventDateDto;

    @ValidateNested()
    @Type(() => LocationDto)
    location!: LocationDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItineraryDto)
    @ArrayMinSize(1)
    itineraries!: ItineraryDto[];

    @IsDate()
    @IsNotEmpty()
    rsvpDueDate!: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactPersonDto)
    @ArrayMinSize(1)
    contactPersons!: ContactPersonDto[];
}

class HostDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}

class CelebratedPersonDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsDate()
    @IsNotEmpty()
    celebrationDate!: Date;

    @IsEnum(CelebratedPersonType)
    @IsNotEmpty()
    type!: CelebratedPersonType;
}

class EventDateDto {
    @IsDate()
    @IsNotEmpty()
    gregorionDate!: Date;

    @IsString()
    @IsOptional()
    hijriDate?: string | null;
}

class LocationDto {
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
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @MinLength(3, { each: true })
    activities!: string[];

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
    @IsOptional()
    phoneNumber?: string | null;

    @IsString()
    @IsOptional()
    whatsappNumber?: string | null;
}
