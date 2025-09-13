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
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { invitationErrors } from '@shared/constants/error-codes';
import { DateValidator } from '@shared/utils/date';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { DateTime } from 'luxon';

describe('@invitation/application/use-cases/update', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000002';

    let useCase: UpdateInvitationUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;
    let mockDateValidator: {
        parseDate: jest.SpyInstance;
        isValidFormat: jest.SpyInstance;
        isOnOrBeforeDate: jest.SpyInstance;
        getDaysBetweenDates: jest.SpyInstance;
    };

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

    beforeEach(async() => {
        const invitationRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };

        const dateValidator = new DateValidator();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateInvitationUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: invitationRepository,
                },
                {
                    provide: 'DateValidator',
                    useValue: dateValidator,
                },
            ],
        }).compile();

        useCase = module.get<UpdateInvitationUseCase>(UpdateInvitationUseCase);
        mockInvitationRepository = module.get('InvitationRepository');

        mockDateValidator = {
            parseDate: jest.spyOn(dateValidator, 'parseDate'),
            isValidFormat: jest.spyOn(dateValidator, 'isValidFormat'),
            isOnOrBeforeDate: jest.spyOn(dateValidator, 'isOnOrBeforeDate'),
            getDaysBetweenDates: jest.spyOn(dateValidator, 'getDaysBetweenDates'),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        let mockIsEventDateInThePast: jest.SpyInstance;
        let mockIsRsvpDueDateAfterEventDate: jest.SpyInstance;

        beforeEach(() => {
            mockIsEventDateInThePast = jest.spyOn(
                useCase,
                'isEventDateInThePast',
            ).mockReturnValue(false);

            mockIsRsvpDueDateAfterEventDate = jest.spyOn(
                useCase,
                'isRsvpDueDateAfterEventDate',
            ).mockReturnValue(false);

            mockInvitationRepository.findById.mockResolvedValue(invitation);
            mockInvitationRepository.update.mockResolvedValue(invitation);
        });

        it('should update invitation successfully with valid props', async() => {
            const result = await useCase.execute(
                invitationId,
                updateInvitationDto,
                user,
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(updateInvitationDto.date?.gregorianDate);
            expect(mockIsRsvpDueDateAfterEventDate).toHaveBeenCalledWith(
                updateInvitationDto.rsvpDueDate,
                updateInvitationDto.date?.gregorianDate,
            );

            expect(mockInvitationRepository.update).toHaveBeenCalledWith(
                invitationId,
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
                userId,
            );

            expect(result).toEqual(invitation);
        });

        it('should throw NotFoundException when invitation not found', async() => {
            const updateData: UpdateInvitationDto = {
                title: 'Updated Title',
            };

            mockInvitationRepository.findById.mockResolvedValue(null);

            await expect(
                useCase.execute(
                    invitationId,
                    updateData,
                    user,
                ),
            ).rejects.toThrow(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockIsEventDateInThePast).not.toHaveBeenCalled();
            expect(mockIsRsvpDueDateAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when event date is in the past', async() => {
            mockIsEventDateInThePast.mockReturnValue(true);

            await expect(useCase.execute(
                invitationId,
                updateInvitationDto,
                user,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(updateInvitationDto.date?.gregorianDate);

            expect(mockIsRsvpDueDateAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when RSVP due date is after event date', async() => {
            mockIsRsvpDueDateAfterEventDate.mockReturnValue(true);

            await expect(useCase.execute(
                invitationId,
                updateInvitationDto,
                user,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.RSVP_DUE_DATE_AFTER_EVENT_DATE),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(updateInvitationDto.date?.gregorianDate);
            expect(mockIsRsvpDueDateAfterEventDate).toHaveBeenCalledWith(
                updateInvitationDto.rsvpDueDate,
                updateInvitationDto.date?.gregorianDate,
            );

            expect(mockInvitationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when update operation fails to return the updated invitation', async() => {
            mockInvitationRepository.findById.mockResolvedValue(invitation);
            mockInvitationRepository.update.mockResolvedValue(null);

            await expect(useCase.execute(
                invitationId,
                updateInvitationDto,
                user,
            )).rejects.toThrow(
                new NotFoundException(invitationErrors.FAILED_TO_UPDATE_INVITATION),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(updateInvitationDto.date?.gregorianDate);
            expect(mockIsRsvpDueDateAfterEventDate).toHaveBeenCalledWith(
                updateInvitationDto.rsvpDueDate,
                updateInvitationDto.date?.gregorianDate,
            );

            expect(mockInvitationRepository.update).toHaveBeenCalledWith(
                invitationId,
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
                userId,
            );
        });
    });

    describe('#isEventDateInThePast', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-06-15T12:00:00.000Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return true when event date is in the past', () => {
            const pastDate = '2020-01-01T00:00:00.000Z';
            const now = DateTime.utc();

            const result = useCase.isEventDateInThePast(pastDate);

            expect(mockDateValidator.parseDate).toHaveBeenCalledWith(pastDate);

            const parsedPastDate = mockDateValidator.parseDate.mock.results[0].value;
            expect(mockDateValidator.isOnOrBeforeDate).toHaveBeenCalledWith(
                parsedPastDate,
                now,
            );

            expect(result).toBe(true);
        });

        it('should return false when event date is in the future', () => {
            const futureDate = '2025-06-15T00:00:00.000Z';
            const now = DateTime.utc();

            const result = useCase.isEventDateInThePast(futureDate);

            expect(mockDateValidator.parseDate).toHaveBeenCalledWith(futureDate);

            const parsedFutureDate = mockDateValidator.parseDate.mock.results[0].value;
            expect(mockDateValidator.isOnOrBeforeDate).toHaveBeenCalledWith(
                parsedFutureDate,
                now,
            );

            expect(result).toBe(false);
        });
    });

    describe('#isRsvpDueDateAfterEventDate', () => {
        const eventDate = '2025-06-15T00:00:00.000Z';

        it('should return true when RSVP due date is after event date', () => {
            const rsvpDate = '2025-06-20T00:00:00.000Z';

            const result = useCase.isRsvpDueDateAfterEventDate(
                rsvpDate,
                eventDate,
            );

            expect(mockDateValidator.parseDate).toHaveBeenCalledTimes(2);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(1, rsvpDate);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(2, eventDate);

            expect(result).toBe(true);
        });

        it('should return false when RSVP due date is before event date', () => {
            const rsvpDate = '2025-06-10T00:00:00.000Z';

            const result = useCase.isRsvpDueDateAfterEventDate(
                rsvpDate,
                eventDate,
            );

            expect(mockDateValidator.parseDate).toHaveBeenCalledTimes(2);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(1, rsvpDate);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(2, eventDate);

            expect(result).toBe(false);
        });
    });
});
