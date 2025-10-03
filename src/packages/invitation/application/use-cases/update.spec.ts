import { InvitationService } from '@invitation/application/services/invitation';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import {
    CelebratedPersonType,
    InvitationType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import {
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { invitationErrors } from '@shared/constants/error-codes';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@invitation/application/use-cases/update', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000002';

    let useCase: UpdateInvitationUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;
    let mockInvitationService: jest.Mocked<InvitationService>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    const updateInvitationDto: UpdateInvitationDto = {
        type: InvitationType.WEDDING,
        title: 'Updated Title',
        hosts: [
            {
                name: 'John Doe',
                title: 'Groom',
                relationshipWithCelebratedPerson: RelationshipType.SPOUSE,
                phoneNumber: '+1234567890',
                email: 'john@example.com',
            },
        ],
        celebratedPersons: [
            {
                name: 'Jane Doe',
                title: 'Bride',
                relationshipWithHost: RelationshipType.SPOUSE,
                celebrationDate: '2025-06-15T00:00:00.000Z',
                type: CelebratedPersonType.BRIDE,
            },
        ],
        date: {
            gregorianDate: '2025-06-15T00:00:00.000Z',
            hijriDate: '1446-10-20',
        },
        location: {
            address: '123 Wedding St, City, Country',
            wazeLink: 'https://waze.com/ul/123',
            googleMapsLink: 'https://maps.google.com/?q=123',
        },
        itineraries: [
            {
                activities: ['Reception', 'Dinner', 'Dancing'],
                startTime: '18:00',
                endTime: '23:00',
            },
        ],
        contactPersons: [
            {
                name: 'Contact Person',
                title: 'Wedding Coordinator',
                relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                phoneNumber: '+1234567890',
                whatsappNumber: '+1234567890',
            },
        ],
        rsvpDueDate: '2025-06-08T00:00:00.000Z',
    };

    const invitation = InvitationFixture.getEntity({
        id: invitationId,
        userId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateInvitationUseCase,
                {
                    provide: InvitationRepository,
                    useValue: createMock<InvitationRepository>(),
                },
                {
                    provide: InvitationService,
                    useValue: createMock<InvitationService>(),
                },
            ],
        }).compile();

        useCase = module.get<UpdateInvitationUseCase>(UpdateInvitationUseCase);
        mockInvitationRepository = module.get(InvitationRepository);
        mockInvitationService = module.get(InvitationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        beforeEach(() => {
            mockInvitationService.findByIdAndUserIdOrFail.mockResolvedValue(invitation);
            mockInvitationService.validateEventDateIsFuture.mockReturnValue();
            mockInvitationService.validateRsvpDueDateNotAfterEventDate.mockReturnValue();
            mockInvitationRepository.updateByIdAndUserId.mockResolvedValue(invitation);
        });

        it('should update invitation successfully with valid props', async () => {
            const result = await useCase.execute(
                user,
                invitationId,
                updateInvitationDto,
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationService.validateEventDateIsFuture).toHaveBeenCalledWith(updateInvitationDto.date?.gregorianDate);
            expect(mockInvitationService.validateRsvpDueDateNotAfterEventDate).toHaveBeenCalledWith(
                updateInvitationDto.rsvpDueDate,
                updateInvitationDto.date?.gregorianDate,
            );

            expect(mockInvitationRepository.updateByIdAndUserId).toHaveBeenCalledWith(
                invitationId,
                userId,
                expect.objectContaining({
                    type: InvitationType.WEDDING,
                    title: 'Updated Title',
                    hosts: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'John Doe',
                            title: 'Groom',
                            relationshipWithCelebratedPerson: RelationshipType.SPOUSE,
                            phoneNumber: '+1234567890',
                            email: 'john@example.com',
                        }),
                    ]),
                    celebratedPersons: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Jane Doe',
                            title: 'Bride',
                            relationshipWithHost: RelationshipType.SPOUSE,
                            celebrationDate: expect.any(Date),
                            type: CelebratedPersonType.BRIDE,
                        }),
                    ]),
                    date: expect.objectContaining({
                        gregorianDate: expect.any(Date),
                        hijriDate: '1446-10-20',
                    }),
                    location: expect.objectContaining({
                        address: '123 Wedding St, City, Country',
                        wazeLink: 'https://waze.com/ul/123',
                        googleMapsLink: 'https://maps.google.com/?q=123',
                    }),
                    itineraries: expect.arrayContaining([
                        expect.objectContaining({
                            activities: ['Reception', 'Dinner', 'Dancing'],
                            startTime: '18:00',
                            endTime: '23:00',
                        }),
                    ]),
                    contactPersons: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Contact Person',
                            title: 'Wedding Coordinator',
                            relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                            phoneNumber: '+1234567890',
                            whatsappNumber: '+1234567890',
                        }),
                    ]),
                    rsvpDueDate: expect.any(Date),
                }),
            );

            expect(result).toEqual(invitation);
        });

        it('should handle NotFoundException', async () => {
            const updateData: UpdateInvitationDto = {
                title: 'Updated Title',
            };

            mockInvitationService.findByIdAndUserIdOrFail.mockRejectedValue(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            await expect(
                useCase.execute(
                    user,
                    invitationId,
                    updateData,
                ),
            ).rejects.toThrow(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationService.validateEventDateIsFuture).not.toHaveBeenCalled();
            expect(mockInvitationService.validateRsvpDueDateNotAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.updateByIdAndUserId).not.toHaveBeenCalled();
        });

        it('should handle BadRequestException', async () => {
            mockInvitationService.validateEventDateIsFuture.mockImplementation(() => {
                throw new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST);
            });

            await expect(useCase.execute(
                user,
                invitationId,
                updateInvitationDto,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST),
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationService.validateEventDateIsFuture).toHaveBeenCalledWith(updateInvitationDto.date?.gregorianDate);

            expect(mockInvitationService.validateRsvpDueDateNotAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.updateByIdAndUserId).not.toHaveBeenCalled();
        });

        it('should throw unexpected error', async () => {
            mockInvitationService.findByIdAndUserIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(
                user,
                invitationId,
                updateInvitationDto,
            )).rejects.toThrow(
                new InternalServerErrorException(new Error('Unexpected error')),
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.updateByIdAndUserId).not.toHaveBeenCalled();
        });
    });
});
