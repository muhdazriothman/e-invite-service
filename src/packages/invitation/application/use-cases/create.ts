import {
    Injectable,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { InvitationRepository } from '@invitation/infra/repository';
import { Invitation } from '@invitation/domain/entities/invitation';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import { DateValidator } from '@common/utils/date';

@Injectable()
export class CreateInvitationUseCase {
    constructor(
        @Inject('InvitationRepository')
        private readonly invitationRepository: InvitationRepository,
        @Inject('DateValidator')
        private readonly dateValidator: DateValidator,
    ) { }

    async execute(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
        try {
            this.validateDates(createInvitationDto);

            const invitation = Invitation.createNew({
                type: createInvitationDto.type,
                title: createInvitationDto.title,
                hosts: createInvitationDto.hosts,
                celebratedPersons: createInvitationDto.celebratedPersons.map(person => ({
                    name: person.name,
                    title: person.title,
                    relationshipWithHost: person.relationshipWithHost,
                    celebrationDate: new Date(person.celebrationDate),
                    type: person.type,
                })),
                date: {
                    gregorianDate: new Date(createInvitationDto.date.gregorianDate),
                    hijriDate: createInvitationDto.date.hijriDate,
                },
                location: createInvitationDto.location,
                itineraries: createInvitationDto.itineraries,
                contactPersons: createInvitationDto.contactPersons,
                rsvpDueDate: new Date(createInvitationDto.rsvpDueDate),
            });

            return await this.invitationRepository.create(invitation);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new Error('Unexpected error: ' + error);
        }
    }

    validateDates(createInvitationDto: CreateInvitationDto): void {
        const eventDate = this.dateValidator.parseDate(createInvitationDto.date.gregorianDate);
        const rsvpDueDate = this.dateValidator.parseDate(createInvitationDto.rsvpDueDate);

        // Event date should not be in the past
        if (this.dateValidator.isPastDate(eventDate)) {
            throw new BadRequestException('date.gregorianDate: Event date cannot be in the past');
        }

        // RSVP due date should be before or on the event date
        if (rsvpDueDate > eventDate) {
            throw new BadRequestException('rsvpDueDate: RSVP due date must be before or on the event date');
        }
    }
}

