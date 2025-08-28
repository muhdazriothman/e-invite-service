import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import {
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { UpdateInvitationUseCase } from './update';
import { InvitationRepository } from '@invitation/infra/repository';
import { DateValidator } from '@common/utils/date';
import { InvitationFixture } from '@test/fixture/invitation';
import { InvitationType } from '@invitation/domain/entities/invitation';

describe('@invitation/application/use-cases/update', () => {
    let useCase: UpdateInvitationUseCase;
    let invitationRepository: jest.Mocked<InvitationRepository>;
    let dateValidator: DateValidator;

    const FIXED_DATE = new Date('2024-01-15T12:00:00.000Z');
    const mockInvitation = InvitationFixture.getInvitationEntity({
        id: 'invitation-id-1',
    });

    beforeEach(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(FIXED_DATE);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateInvitationUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: 'DateValidator',
                    useFactory: () => new DateValidator(),
                },
            ],
        }).compile();

        useCase = module.get<UpdateInvitationUseCase>(UpdateInvitationUseCase);
        invitationRepository = module.get('InvitationRepository');
        dateValidator = module.get('DateValidator');
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should update invitation successfully', async () => {
            const invitationId = 'invitation-id-1';
            const updateData = InvitationFixture.getCreateInvitationDto({
                title: 'Updated Wedding Celebration',
                type: InvitationType.WEDDING,
            });
            const updatedInvitation = { ...mockInvitation, title: 'Updated Wedding Celebration' };

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.update.mockResolvedValue(updatedInvitation);

            const result = await useCase.execute(invitationId, updateData);

            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(invitationRepository.update).toHaveBeenCalledWith(invitationId, {
                type: updateData.type,
                title: updateData.title,
                hosts: updateData.hosts,
                celebratedPersons: updateData.celebratedPersons.map(person => ({
                    name: person.name,
                    title: person.title,
                    relationshipWithHost: person.relationshipWithHost,
                    celebrationDate: new Date(person.celebrationDate),
                    type: person.type,
                })),
                date: {
                    gregorianDate: new Date(updateData.date.gregorianDate),
                    hijriDate: updateData.date.hijriDate,
                },
                location: updateData.location,
                itineraries: updateData.itineraries.map(itinerary => ({
                    activities: itinerary.activities,
                    startTime: itinerary.startTime,
                    endTime: itinerary.endTime,
                })),
                contactPersons: updateData.contactPersons,
                rsvpDueDate: new Date(updateData.rsvpDueDate),
            });
            expect(result).toEqual(updatedInvitation);
        });

        it('should not validate existing data when no date fields are updated', async () => {
            const invitationId = 'invitation-id-1';
            const updateData = {
                title: 'Updated Title', // No date fields
            };
            const updatedInvitation = { ...mockInvitation, title: 'Updated Title' };

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.update.mockResolvedValue(updatedInvitation);

            const result = await useCase.execute(invitationId, updateData);

            expect(result).toEqual(updatedInvitation);
            expect(invitationRepository.update).toHaveBeenCalledWith(invitationId, {
                title: 'Updated Title',
            });
        });

        it('should throw NotFoundException when invitation not found', async () => {
            const invitationId = 'non-existent-id';
            const updateData = InvitationFixture.getCreateInvitationDto();

            invitationRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(invitationId, updateData)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(invitationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when update operation fails to return the updated invitation', async () => {
            const invitationId = 'invitation-id-1';
            const updateData = InvitationFixture.getCreateInvitationDto();

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.update.mockResolvedValue(null);

            await expect(useCase.execute(invitationId, updateData)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(invitationRepository.update).toHaveBeenCalled();
        });
    });

    describe('validateDates', () => {
        it('should pass validation when no date fields are provided', () => {
            const updateData = {
                title: 'Updated Title', // No date fields
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).not.toThrow();
        });

        it('should pass validation when RSVP date is before existing event date', () => {
            const updateData = {
                rsvpDueDate: '2024-06-10T00:00:00.000Z', // Before existing event date (2024-06-15)
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).not.toThrow();
        });

        it('should pass validation when RSVP date is before new event date', () => {
            const updateData = {
                date: {
                    gregorianDate: '2025-06-15T00:00:00.000Z', // Future date
                    hijriDate: '1446-12-19',
                },
                rsvpDueDate: '2025-06-10T00:00:00.000Z', // Before new event date
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).not.toThrow();
        });

        it('should pass validation when RSVP date is on the same day as event date', () => {
            const updateData = {
                date: {
                    gregorianDate: '2025-06-15T00:00:00.000Z', // Future date
                    hijriDate: '1446-12-19',
                },
                rsvpDueDate: '2025-06-15T00:00:00.000Z', // Same day as event date
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).not.toThrow();
        });

        it('should validate only new event date when only event date is provided', () => {
            const updateData = {
                date: {
                    gregorianDate: '2025-06-15T00:00:00.000Z', // Future date
                    hijriDate: '1446-12-19',
                },
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).not.toThrow();
        });

        it('should throw BadRequestException when updating event date to past date', () => {
            const updateData = {
                date: {
                    gregorianDate: '2023-06-15T00:00:00.000Z', // Past date
                    hijriDate: '1444-11-26',
                },
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).toThrow(BadRequestException);
        });

        it('should throw BadRequestException when updating RSVP date to after event date', () => {
            const updateData = {
                rsvpDueDate: '2025-06-20T00:00:00.000Z', // After event date
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).toThrow(BadRequestException);
        });

        it('should throw BadRequestException when updating RSVP date to after new event date', () => {
            const updateData = {
                date: {
                    gregorianDate: '2025-06-15T00:00:00.000Z', // Future date
                    hijriDate: '1446-12-19',
                },
                rsvpDueDate: '2025-06-20T00:00:00.000Z', // After new event date
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).toThrow(BadRequestException);
        });

        it('should throw BadRequestException when updating RSVP date to after existing event date', () => {
            const updateData = {
                rsvpDueDate: '2024-06-20T00:00:00.000Z', // After existing event date (2024-06-15)
            };

            expect(() => useCase.validateDates(updateData, mockInvitation)).toThrow(BadRequestException);
        });
    });
});
