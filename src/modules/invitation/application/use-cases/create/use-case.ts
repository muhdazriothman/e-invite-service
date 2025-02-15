import { validate } from 'class-validator';

import { CreateInvitationDto} from './dto';

import { Invitation } from '../../../domain/entities/invitation';
import { InvitationRepository } from '../../../infra/repositories/invitation/repository';

import { ValidationError } from '../../../../common/application/exceptions';

import { ValidationErrorResolver } from '../../../../common/infra/validation-error-resolver';

interface Dependencies {
    invitationRepository: InvitationRepository;
}

export class CreateInvitationUseCase {
    invitationRepository: InvitationRepository;

    constructor(dependencies: Dependencies) {
        const {
            invitationRepository
        } = dependencies;

        if (!(invitationRepository instanceof InvitationRepository)) {
            throw new Error('invitationRepository is not an instance of InvitationRepository');
        }

        this.invitationRepository = dependencies.invitationRepository;
    }

    static create(dependencies: Dependencies): CreateInvitationUseCase {
        const {
            invitationRepository
        } = dependencies;

        return new CreateInvitationUseCase({
            invitationRepository
        });
    }

    async execute(dto: CreateInvitationDto): Promise<Invitation> {
        await CreateInvitationUseCase.validateDto(dto);

        const itinerary = [];

        for (const itineraryItem of dto.itinerary) {
            itinerary.push({
                activity: itineraryItem.activity,
                startTime: itineraryItem.startTime,
                endTime: itineraryItem.endTime
            });
        }

        const contactPersons = [];

        for (const contactPerson of dto.contactPersons) {
            contactPersons.push({
                name: contactPerson.name,
                phoneNumber: contactPerson.phoneNumber
            });
        }

        const invitation = Invitation.create({
            title: dto.title,
            groomsName: dto.groomsName,
            bridesName: dto.bridesName,
            firstHostName: dto.firstHostName,
            secondHostName: dto.secondHostName,
            weddingDate: {
                gregorionDate: dto.weddingDate.gregorionDate,
                hijriDate: dto.weddingDate.hijriDate
            },
            weddingLocation: {
                address: dto.weddingLocation.address,
                wazeLink: dto.weddingLocation.wazeLink,
                googleMapsLink: dto.weddingLocation.googleMapsLink
            },
            itinerary,
            contactPersons
        });

        return await this.invitationRepository.create(invitation);
    }

    static async validateDto(dto: CreateInvitationDto): Promise<void> {
        if (!(dto instanceof CreateInvitationDto)) {
            throw new Error('dto is not an instance of CreateInvitationDTO');
        }

        const errors = await validate(dto);

        if (errors.length > 0) {
            const errorMessages = ValidationErrorResolver.resolveValidationErrors(errors);

            throw new ValidationError({
                message: 'Invalid invitation data',
                errors: errorMessages
            });
        }
    }
}
