import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InvitationRepository } from '@invitation/infra/repository';
import { Invitation } from '@invitation/domain/entities/invitation';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import { DateValidator } from '@common/utils/date';

@Injectable()
export class UpdateInvitationUseCase {
    constructor(
        @Inject('InvitationRepository')
        private readonly invitationRepository: InvitationRepository,
        @Inject('DateValidator')
        private readonly dateValidator: DateValidator,
    ) { }

    async execute(id: string, updateInvitationDto: UpdateInvitationDto, userId?: string): Promise<Invitation> {
        const existingInvitation = await this.invitationRepository.findById(id, userId);

        if (!existingInvitation) {
            throw new NotFoundException('Invitation not found');
        }

        // Validate dates if they are being updated
        if (updateInvitationDto.date || updateInvitationDto.rsvpDueDate) {
            this.validateDates(updateInvitationDto, existingInvitation);
        }

        // Build update object with only provided fields
        const updateData: Partial<Invitation> = {};

        if (updateInvitationDto.type !== undefined) {
            updateData.type = updateInvitationDto.type;
        }

        if (updateInvitationDto.title !== undefined) {
            updateData.title = updateInvitationDto.title;
        }

        if (updateInvitationDto.hosts !== undefined) {
            updateData.hosts = updateInvitationDto.hosts.map(host => ({
                name: host.name!,
                title: host.title!,
                relationshipWithCelebratedPerson: host.relationshipWithCelebratedPerson!,
                phoneNumber: host.phoneNumber,
                email: host.email,
            }));
        }

        if (updateInvitationDto.celebratedPersons !== undefined) {
            updateData.celebratedPersons = updateInvitationDto.celebratedPersons.map(person => ({
                name: person.name!,
                title: person.title!,
                relationshipWithHost: person.relationshipWithHost!,
                celebrationDate: new Date(person.celebrationDate!),
                type: person.type!,
            }));
        }

        if (updateInvitationDto.date !== undefined) {
            updateData.date = {
                gregorianDate: new Date(updateInvitationDto.date.gregorianDate!),
                hijriDate: updateInvitationDto.date.hijriDate,
            };
        }

        if (updateInvitationDto.location !== undefined) {
            updateData.location = {
                address: updateInvitationDto.location.address!,
                wazeLink: updateInvitationDto.location.wazeLink,
                googleMapsLink: updateInvitationDto.location.googleMapsLink,
            };
        }

        if (updateInvitationDto.itineraries !== undefined) {
            updateData.itineraries = updateInvitationDto.itineraries.map(itinerary => ({
                activities: itinerary.activities!,
                startTime: itinerary.startTime!,
                endTime: itinerary.endTime!,
            }));
        }

        if (updateInvitationDto.contactPersons !== undefined) {
            updateData.contactPersons = updateInvitationDto.contactPersons.map(contact => ({
                name: contact.name!,
                title: contact.title!,
                relationshipWithCelebratedPerson: contact.relationshipWithCelebratedPerson!,
                phoneNumber: contact.phoneNumber,
                whatsappNumber: contact.whatsappNumber,
            }));
        }

        if (updateInvitationDto.rsvpDueDate !== undefined) {
            updateData.rsvpDueDate = new Date(updateInvitationDto.rsvpDueDate);
        }

        const result = await this.invitationRepository.update(id, updateData, userId);

        if (!result) {
            throw new NotFoundException('Failed to update invitation');
        }

        return result;
    }

    validateDates(updateInvitationDto: UpdateInvitationDto, existingInvitation: Invitation): void {
        if (updateInvitationDto.date?.gregorianDate) {
            const eventDate = this.dateValidator.parseDate(updateInvitationDto.date.gregorianDate);
            if (this.dateValidator.isPastDate(eventDate)) {
                throw new BadRequestException('eventDate: Event date cannot be in the past');
            }
        }

        if (updateInvitationDto.rsvpDueDate) {
            const rsvpDate = this.dateValidator.parseDate(updateInvitationDto.rsvpDueDate);

            // Get event date (new or existing)
            const eventDateString = updateInvitationDto.date?.gregorianDate || existingInvitation.date.gregorianDate.toISOString();
            const eventDate = this.dateValidator.parseDate(eventDateString);

            if (rsvpDate > eventDate) {
                throw new BadRequestException('rsvpDueDate: RSVP due date must be before or on the event date');
            }
        }
    }
}
