import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateInvitationUseCase } from './update';
import { InvitationRepository } from '@invitation/infra/repository';
import { InvitationFixture } from '@test/fixture/invitation';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import { DateValidator } from '@shared/utils/date';

describe('@invitation/application/use-cases/update', () => {
    let useCase: UpdateInvitationUseCase;
    let invitationRepository: jest.Mocked<InvitationRepository>;

    const mockInvitation = InvitationFixture.getInvitationEntity();
    const updatedInvitation = InvitationFixture.getInvitationEntity({
        title: 'Updated Title',
    });

    beforeEach(async () => {
        const mockInvitationRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };

        const mockDateValidator = {
            parseDate: jest.fn(),
            isPastDate: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateInvitationUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: mockInvitationRepository,
                },
                {
                    provide: 'DateValidator',
                    useValue: mockDateValidator,
                },
            ],
        }).compile();

        useCase = module.get<UpdateInvitationUseCase>(UpdateInvitationUseCase);
        invitationRepository = module.get('InvitationRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should update invitation successfully', async () => {
            const invitationId = 'invitation-id-1';
            const userId = '000000000000000000000001';
            const updateData: UpdateInvitationDto = {
                type: mockInvitation.type,
                title: 'Updated Title',
                hosts: mockInvitation.hosts,
                celebratedPersons: mockInvitation.celebratedPersons.map(person => ({
                    ...person,
                    celebrationDate: person.celebrationDate.toISOString(),
                })),
                date: {
                    gregorianDate: mockInvitation.date.gregorianDate.toISOString(),
                    hijriDate: mockInvitation.date.hijriDate,
                },
                location: mockInvitation.location,
                itineraries: mockInvitation.itineraries,
                contactPersons: mockInvitation.contactPersons,
                rsvpDueDate: mockInvitation.rsvpDueDate.toISOString(),
            };

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.update.mockResolvedValue(updatedInvitation);

            const result = await useCase.execute(invitationId, updateData, userId);

            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId, userId);
            expect(invitationRepository.update).toHaveBeenCalledWith(invitationId, {
                type: updateData.type,
                title: updateData.title,
                hosts: updateData.hosts,
                celebratedPersons: expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String),
                        celebrationDate: expect.any(Date),
                    }),
                ]),
                date: expect.objectContaining({
                    gregorianDate: expect.any(Date),
                    hijriDate: updateData.date!.hijriDate,
                }),
                location: updateData.location,
                itineraries: updateData.itineraries,
                contactPersons: updateData.contactPersons,
                rsvpDueDate: expect.any(Date),
            }, userId);
            expect(result).toEqual(updatedInvitation);
        });

        it('should not validate existing data when no date fields are updated', async () => {
            const invitationId = 'invitation-id-1';
            const userId = '000000000000000000000001';
            const updateData: UpdateInvitationDto = {
                title: 'Updated Title',
            };

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.update.mockResolvedValue(updatedInvitation);

            const result = await useCase.execute(invitationId, updateData, userId);

            expect(result).toEqual(updatedInvitation);
            expect(invitationRepository.update).toHaveBeenCalledWith(invitationId, {
                title: 'Updated Title',
            }, userId);
        });

        it('should throw NotFoundException when invitation not found', async () => {
            const invitationId = 'non-existent-id';
            const userId = '000000000000000000000001';
            const updateData: UpdateInvitationDto = {
                title: 'Updated Title',
            };

            invitationRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(invitationId, updateData, userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId, userId);
            expect(invitationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when update operation fails to return the updated invitation', async () => {
            const invitationId = 'invitation-id-1';
            const userId = '000000000000000000000001';
            const updateData: UpdateInvitationDto = {
                title: 'Updated Title',
            };

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.update.mockResolvedValue(null);

            await expect(useCase.execute(invitationId, updateData, userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId, userId);
            expect(invitationRepository.update).toHaveBeenCalled();
        });
    });
});
