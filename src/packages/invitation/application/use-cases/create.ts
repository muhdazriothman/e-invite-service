import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import {
    Injectable,
    Inject,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { DateValidator } from '@shared/utils/date';
import { User } from '@user/domain/entities/user';

@Injectable()
export class CreateInvitationUseCase {
    constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,
    @Inject('DateValidator')
    private readonly dateValidator: DateValidator,
    ) {}

    async execute(
        createInvitationDto: CreateInvitationDto,
        user: User,
    ): Promise<Invitation> {
        try {
            const currentInvitationCount =
        await this.invitationRepository.countByUserId(user.id);
            if (currentInvitationCount >= user.capabilities.invitationLimit) {
                throw new ForbiddenException(
                    `You have reached your invitation limit (${user.capabilities.invitationLimit}). ` +
                    'Please upgrade your plan to create more invitations.',
                );
            }

            const invitation = Invitation.createNew(createInvitationDto, user.id);

            this.validateDates(invitation);

            return await this.invitationRepository.create(invitation);
        } catch (error) {
            if (
                error instanceof BadRequestException ||
        error instanceof ForbiddenException
            ) {
                throw error;
            }

            throw new Error('Unexpected error: ' + error);
        }
    }

    validateDates(invitation: Invitation): void {
        const eventDate = this.dateValidator.parseDate(
            invitation.date.gregorianDate.toISOString(),
        );
        const rsvpDueDate = this.dateValidator.parseDate(
            invitation.rsvpDueDate.toISOString(),
        );

        // Event date should not be in the past
        if (this.dateValidator.isPastDate(eventDate)) {
            throw new BadRequestException(
                'date.gregorianDate: Event date cannot be in the past',
            );
        }

        // RSVP due date should be before or on the event date
        if (rsvpDueDate > eventDate) {
            throw new BadRequestException(
                'rsvpDueDate: RSVP due date must be before or on the event date',
            );
        }
    }
}
