import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { invitationErrors } from '@shared/constants/error-codes';
import { DateValidator } from '@shared/utils/date';
import { User } from '@user/domain/entities/user';
import { DateTime } from 'luxon';

@Injectable()
export class UpdateInvitationUseCase {
    constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,

    @Inject('DateValidator')
    private readonly dateValidator: DateValidator,
    ) {}

    async execute(
        id: string,
        updateInvitationDto: UpdateInvitationDto,
        user?: User,
    ): Promise<Invitation> {
        const {
            date,
            rsvpDueDate,
            type,
            title,
            hosts,
            celebratedPersons,
            location,
            itineraries,
            contactPersons,
        } = updateInvitationDto;

        const {
            id: userId,
        } = user!;

        const existingInvitation = await this.invitationRepository.findById(
            id,
            userId,
        );

        if (!existingInvitation) {
            throw new NotFoundException(invitationErrors.INVITATION_NOT_FOUND);
        }

        if (date?.gregorianDate) {
            if (this.isEventDateInThePast(date.gregorianDate)) {
                throw new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST);
            }
        }

        if (rsvpDueDate) {
            const eventDate = date?.gregorianDate || existingInvitation.date.gregorianDate.toISOString();
            if (this.isRsvpDueDateAfterEventDate(rsvpDueDate, eventDate)) {
                throw new BadRequestException(invitationErrors.RSVP_DUE_DATE_AFTER_EVENT_DATE);
            }
        }

        const updateData: Partial<Invitation> = {};

        if (type !== undefined) {
            updateData.type = updateInvitationDto.type;
        }

        if (title !== undefined) {
            updateData.title = updateInvitationDto.title;
        }

        if (hosts !== undefined) {
            updateData.hosts = [];

            for (const host of hosts) {
                updateData.hosts.push({
                    name: host.name!,
                    title: host.title!,
                    relationshipWithCelebratedPerson: host.relationshipWithCelebratedPerson!,
                    phoneNumber: host.phoneNumber,
                    email: host.email,
                });
            }
        }

        if (celebratedPersons !== undefined) {
            updateData.celebratedPersons = [];

            for (const person of celebratedPersons) {
                updateData.celebratedPersons.push({
                    name: person.name!,
                    title: person.title!,
                    relationshipWithHost: person.relationshipWithHost!,
                    celebrationDate: new Date(person.celebrationDate!),
                    type: person.type!,
                });
            }
        }

        if (date !== undefined) {
            updateData.date = {
                gregorianDate: new Date(date.gregorianDate!),
                hijriDate: date.hijriDate,
            };
        }

        if (location !== undefined) {
            updateData.location = {
                address: location.address!,
                wazeLink: location.wazeLink,
                googleMapsLink: location.googleMapsLink,
            };
        }

        if (itineraries !== undefined) {
            updateData.itineraries = [];

            for (const itinerary of itineraries) {
                updateData.itineraries.push({
                    activities: itinerary.activities!,
                    startTime: itinerary.startTime!,
                    endTime: itinerary.endTime!,
                });
            }
        }

        if (contactPersons !== undefined) {
            updateData.contactPersons = [];

            for (const contact of contactPersons) {
                updateData.contactPersons.push({
                    name: contact.name!,
                    title: contact.title!,
                    relationshipWithCelebratedPerson: contact.relationshipWithCelebratedPerson!,
                    phoneNumber: contact.phoneNumber,
                    whatsappNumber: contact.whatsappNumber,
                });
            }
        }

        if (rsvpDueDate !== undefined) {
            updateData.rsvpDueDate = new Date(rsvpDueDate);
        }

        const result = await this.invitationRepository.update(
            id,
            updateData,
            userId,
        );

        if (!result) {
            throw new NotFoundException(invitationErrors.FAILED_TO_UPDATE_INVITATION);
        }

        return result;
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
