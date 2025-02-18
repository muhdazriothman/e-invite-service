import { validate } from 'class-validator';

import { CreateInvitationDto} from './dto';

import { Invitation } from '../../../domain/entities/invitation';
import { InvitationFactory } from '../../../domain/factories/invitation';
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

        const invitation = InvitationFactory.create(dto);

        return await this.invitationRepository.create(invitation);
    }

    static async validateDto(dto: CreateInvitationDto): Promise<void> {
        if (!(dto instanceof CreateInvitationDto)) {
            throw new Error('dto is not an instance of CreateInvitationDto');
        }

        const errors = await validate(dto);

        if (errors.length > 0) {
            const errorMessages = ValidationErrorResolver.resolveValidationErrors(errors);

            throw new ValidationError({
                message: 'Invalid parameters',
                errors: errorMessages
            });
        }
    }
}
