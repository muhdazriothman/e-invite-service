import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { invitationErrors } from '@shared/constants/error-codes';
import { DateValidator } from '@shared/utils/date';
import { DateTime } from 'luxon';

@Injectable()
export class InvitationService {
    constructor (
        private readonly invitationRepository: InvitationRepository,

        private readonly dateValidator: DateValidator,
    ) { }

    async findByIdOrFail (
        id: string,
    ): Promise<Invitation> {
        const invitation = await this.invitationRepository.findById(
            id,
        );
        if (!invitation) {
            throw new NotFoundException(invitationErrors.INVITATION_NOT_FOUND);
        }

        return invitation;
    }

    async findByIdAndUserIdOrFail (
        id: string,
        userId: string,
    ): Promise<Invitation> {
        const invitation = await this.invitationRepository.findByIdAndUserId(
            id,
            userId,
        );
        if (!invitation) {
            throw new NotFoundException(invitationErrors.INVITATION_NOT_FOUND);
        }

        return invitation;
    }

    validateEventDateIsFuture (
        eventDate: string,
    ): void {
        const now = DateTime.utc();
        const parsedDate = this.dateValidator.parseDate(eventDate);

        const isEventDateInThePast = DateValidator.isOnOrBeforeDate(
            parsedDate,
            now,
        );

        if (isEventDateInThePast) {
            throw new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST);
        }
    }

    validateRsvpDueDateNotAfterEventDate (
        rsvpDueDate: string,
        eventDate: string,
    ): void {
        const parsedRsvpDate = this.dateValidator.parseDate(rsvpDueDate);
        const parsedEventDate = this.dateValidator.parseDate(eventDate);

        if (parsedRsvpDate > parsedEventDate) {
            throw new BadRequestException(invitationErrors.RSVP_DUE_DATE_AFTER_EVENT_DATE);
        }
    }
}
