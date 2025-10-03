import {
    InvitationType,
    CelebratedPersonType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { Type } from 'class-transformer';
import {
    IsString,
    IsEnum,
    IsArray,
    ValidateNested,
    IsDateString,
    IsOptional,
    IsUrl,
    ArrayMinSize,
    IsNotEmpty,
    Matches,
} from 'class-validator';

export class HostDto {
    @IsString()
        name: string;

    @IsString()
        title: string;

    @IsEnum(RelationshipType)
        relationshipWithCelebratedPerson: RelationshipType;

    @IsOptional()
    @IsString()
        phoneNumber?: string | null;

    @IsOptional()
    @IsString()
        email?: string | null;
}

export class CelebratedPersonDto {
    @IsString()
        name: string;

    @IsString()
        title: string;

    @IsEnum(RelationshipType)
        relationshipWithHost: RelationshipType;

    @IsDateString()
        celebrationDate: string;

    @IsEnum(CelebratedPersonType)
        type: CelebratedPersonType;
}

export class EventDateDto {
    @IsDateString()
        gregorianDate: string;

    @IsOptional()
    @IsString()
        hijriDate?: string | null;
}

export class LocationDto {
    @IsString()
        address: string;

    @IsOptional()
    @IsUrl()
        wazeLink?: string | null;

    @IsOptional()
    @IsUrl()
        googleMapsLink?: string | null;
}

export class ItineraryDto {
    @IsArray()
    @IsString({ each: true })
        activities: string[];

    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'startTime must be a valid time in HH:MM format (24-hour)',
    })
        startTime: string;

    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'endTime must be a valid time in HH:MM format (24-hour)',
    })
        endTime: string;
}

export class ContactPersonDto {
    @IsString()
    name: string;

    @IsString()
    title: string;

    @IsEnum(RelationshipType)
        relationshipWithCelebratedPerson: RelationshipType;

    @IsOptional()
    @IsString()
        phoneNumber?: string | null;

    @IsOptional()
    @IsString()
        whatsappNumber?: string | null;
}

export class CreateInvitationDto {
    @IsEnum(InvitationType)
    type: InvitationType;

    @IsString()
    title: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HostDto)
    @ArrayMinSize(1)
    hosts: HostDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CelebratedPersonDto)
    @ArrayMinSize(1)
    celebratedPersons: CelebratedPersonDto[];

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => EventDateDto)
    date: EventDateDto;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItineraryDto)
    @ArrayMinSize(1)
    itineraries: ItineraryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactPersonDto)
    @ArrayMinSize(1)
    contactPersons: ContactPersonDto[];

    @IsDateString()
    rsvpDueDate: string;
}
