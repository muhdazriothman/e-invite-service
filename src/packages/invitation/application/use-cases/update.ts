import { InvitationService } from '@invitation/application/services/invitation';
import {
    Invitation,
    UpdateInvitationProps,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { invitationErrors } from '@shared/constants/error-codes';
import { User } from '@user/domain/entities/user';

@Injectable()
export class UpdateInvitationUseCase {
    constructor (
        private readonly invitationRepository: InvitationRepository,

        private readonly invitationService: InvitationService,
    ) { }

    async execute (
        user: User,
        id: string,
        updateInvitationDto: UpdateInvitationDto,
    ): Promise<Invitation> {
        const {
            id: userId,
        } = user;

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

        try {
            const invitation = await this.invitationService.findByIdAndUserIdOrFail(
                id,
                userId,
            );

            if (date?.gregorianDate) {
                this.invitationService.validateEventDateIsFuture(date.gregorianDate);
            }

            if (rsvpDueDate) {
                const eventDate = date?.gregorianDate || invitation.date.gregorianDate.toISOString();
                this.invitationService.validateRsvpDueDateNotAfterEventDate(
                    rsvpDueDate,
                    eventDate,
                );
            }

            const updateData: Partial<UpdateInvitationProps> = {};

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

            const result = await this.invitationRepository.updateByIdAndUserId(
                id,
                userId,
                updateData,
            );

            if (!result) {
                throw new NotFoundException(invitationErrors.FAILED_TO_UPDATE_INVITATION);
            }

            return result;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}
