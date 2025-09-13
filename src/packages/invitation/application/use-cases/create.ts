import {
    CelebratedPerson,
    ContactPerson,
    Host,
    Invitation,
    Itinerary,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import {
    Injectable,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { DateValidator } from '@shared/utils/date';
import { User } from '@user/domain/entities/user';
import { DateTime } from 'luxon';

import { invitationErrors } from '../../../shared/constants/error-codes';

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
        const {
            id: userId,
            capabilities,
        } = user;

        const {
            type,
            title,
            hosts,
            celebratedPersons,
            location,
            itineraries,
            contactPersons,
            date,
            rsvpDueDate,
        } = createInvitationDto;

        try {
            if (!CreateInvitationUseCase.doesUserHaveInvitationLimitCapabilities(capabilities?.invitationLimit)) {
                throw new BadRequestException(invitationErrors.CAPABILITIES_NOT_FOUND);
            }

            if (await this.hasInvitationLimitReached(userId, capabilities!.invitationLimit)) {
                throw new BadRequestException(invitationErrors.LIMIT_REACHED);
            }

            if (this.isEventDateInThePast(date.gregorianDate)) {
                throw new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST);
            }

            if (this.isRsvpDueDateAfterEventDate(rsvpDueDate, date.gregorianDate)) {
                throw new BadRequestException(invitationErrors.RSVP_DUE_DATE_AFTER_EVENT_DATE);
            }

            const mappedHosts: Host[] = [];
            for (const host of hosts) {
                mappedHosts.push({
                    name: host.name,
                    title: host.title,
                    relationshipWithCelebratedPerson: host.relationshipWithCelebratedPerson,
                });
            }

            const mappedCelebratedPersons: CelebratedPerson[] = [];
            for (const person of celebratedPersons) {
                mappedCelebratedPersons.push({
                    name: person.name,
                    title: person.title,
                    relationshipWithHost: person.relationshipWithHost,
                    celebrationDate: new Date(person.celebrationDate),
                    type: person.type,
                });
            }

            const mappedItineraries: Itinerary[] = [];
            for (const itinerary of itineraries) {
                mappedItineraries.push({
                    activities: itinerary.activities,
                    startTime: itinerary.startTime,
                    endTime: itinerary.endTime,
                });
            }

            const mappedContactPersons: ContactPerson[] = [];
            for (const person of contactPersons) {
                mappedContactPersons.push({
                    name: person.name,
                    title: person.title,
                    relationshipWithCelebratedPerson: person.relationshipWithCelebratedPerson,
                    phoneNumber: person.phoneNumber,
                    whatsappNumber: person.whatsappNumber,
                });
            }

            const invitation = Invitation.createNew({
                userId,
                type,
                title,
                hosts: mappedHosts,
                celebratedPersons: mappedCelebratedPersons,
                date: {
                    gregorianDate: new Date(date.gregorianDate),
                    hijriDate: date.hijriDate,
                },
                location,
                itineraries: mappedItineraries,
                contactPersons: mappedContactPersons,
                rsvpDueDate: new Date(rsvpDueDate),
            });

            return await this.invitationRepository.create(invitation);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new Error('Unexpected error: ' + error);
        }
    }

    static doesUserHaveInvitationLimitCapabilities(invitationLimit: number | undefined): boolean {
        return invitationLimit !== undefined && invitationLimit > 0;
    }

    async hasInvitationLimitReached(
        userId: string,
        invitationLimit: number,
    ): Promise<boolean> {
        const currentInvitationCount = await this.invitationRepository.countByUserId(userId);
        return currentInvitationCount >= invitationLimit;
    }

    isEventDateInThePast(eventDate: string): boolean {
        const now = DateTime.utc();
        const parsedDate = this.dateValidator.parseDate(eventDate);

        return this.dateValidator.isOnOrBeforeDate(
            parsedDate,
            now,
        );
    }

    isRsvpDueDateAfterEventDate(
        rsvpDueDate: string,
        eventDate: string,
    ): boolean {
        const parsedRsvpDate = this.dateValidator.parseDate(rsvpDueDate);
        const parsedEventDate = this.dateValidator.parseDate(eventDate);
        return parsedRsvpDate > parsedEventDate;
    }
}
