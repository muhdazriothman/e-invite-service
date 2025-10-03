import { InvitationService } from '@invitation/application/services/invitation';
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
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { invitationErrors } from '@shared/constants/error-codes';
import { User } from '@user/domain/entities/user';

@Injectable()
export class CreateInvitationUseCase {
    constructor (
        private readonly invitationRepository: InvitationRepository,

        private readonly invitationService: InvitationService,
    ) { }

    async execute (
        user: User,
        createInvitationDto: CreateInvitationDto,
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
            CreateInvitationUseCase.validateInvitationLimitCapabilities(capabilities?.invitationLimit);

            await this.validateInvitationLimitReached(userId, capabilities!.invitationLimit);

            this.invitationService.validateEventDateIsFuture(date.gregorianDate);

            this.invitationService.validateRsvpDueDateNotAfterEventDate(rsvpDueDate, date.gregorianDate);

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

            throw new InternalServerErrorException(error);
        }
    }

    static validateInvitationLimitCapabilities (
        invitationLimit: number | undefined,
    ): void {
        const hasInvitationLimitCapabilities = invitationLimit !== undefined && invitationLimit > 0;
        if (!hasInvitationLimitCapabilities) {
            throw new BadRequestException(invitationErrors.CAPABILITIES_NOT_FOUND);
        }
    }

    async validateInvitationLimitReached (
        userId: string,
        invitationLimit: number,
    ): Promise<void> {
        const currentInvitationCount = await this.invitationRepository.countByUserId(userId);
        if (currentInvitationCount >= invitationLimit) {
            throw new BadRequestException(invitationErrors.LIMIT_REACHED);
        }
    }
}
