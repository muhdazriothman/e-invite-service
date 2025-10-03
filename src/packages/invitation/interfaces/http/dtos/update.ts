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

export class UpdateHostDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(RelationshipType)
    relationshipWithCelebratedPerson?: RelationshipType;

    @IsOptional()
    @IsString()
    phoneNumber?: string | null;

    @IsOptional()
    @IsString()
    email?: string | null;
}

export class UpdateCelebratedPersonDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(RelationshipType)
    relationshipWithHost?: RelationshipType;

    @IsOptional()
    @IsDateString()
    celebrationDate?: string;

    @IsOptional()
    @IsEnum(CelebratedPersonType)
    type?: CelebratedPersonType;
}

export class UpdateEventDateDto {
    @IsOptional()
    @IsDateString()
    gregorianDate?: string;

    @IsOptional()
    @IsString()
    hijriDate?: string | null;
}

export class UpdateLocationDto {
    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsUrl()
    wazeLink?: string | null;

    @IsOptional()
    @IsUrl()
    googleMapsLink?: string | null;
}

export class UpdateItineraryDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    activities?: string[];

    @IsOptional()
    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'startTime must be in HH:MM format',
    })
    startTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'endTime must be in HH:MM format',
    })
    endTime?: string;
}

export class UpdateContactPersonDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(RelationshipType)
    relationshipWithCelebratedPerson?: RelationshipType;

    @IsOptional()
    @IsString()
    phoneNumber?: string | null;

    @IsOptional()
    @IsString()
    whatsappNumber?: string | null;
}

export class UpdateInvitationDto {
    @IsOptional()
    @IsEnum(InvitationType)
    type?: InvitationType;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateHostDto)
    @ArrayMinSize(1)
    hosts?: UpdateHostDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateCelebratedPersonDto)
    @ArrayMinSize(1)
    celebratedPersons?: UpdateCelebratedPersonDto[];

    @IsOptional()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UpdateEventDateDto)
    date?: UpdateEventDateDto;

    @IsOptional()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UpdateLocationDto)
    location?: UpdateLocationDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateItineraryDto)
    @ArrayMinSize(1)
    itineraries?: UpdateItineraryDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateContactPersonDto)
    @ArrayMinSize(1)
    contactPersons?: UpdateContactPersonDto[];

    @IsOptional()
    @IsDateString()
    rsvpDueDate?: string;
}
