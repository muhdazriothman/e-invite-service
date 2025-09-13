import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import {
    CelebratedPersonType,
    Invitation,
    InvitationType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import { BadRequestException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { invitationErrors } from '@shared/constants/error-codes';
import { DateValidator } from '@shared/utils/date';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { DateTime } from 'luxon';


describe('@invitation/application/use-cases/create', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000002';

    let useCase: CreateInvitationUseCase;
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

    const createInvitationDto: CreateInvitationDto = {
        type: InvitationType.WEDDING,
        title: 'Wedding Celebration',
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
            create: jest.fn(),
            countByUserId: jest.fn(),
        };

        const dateValidator = new DateValidator();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInvitationUseCase,
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

        useCase = module.get<CreateInvitationUseCase>(CreateInvitationUseCase);
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
        let mockDoesUserHaveInvitationLimitCapabilities: jest.SpyInstance;
        let spyInvitationCreateNew: jest.SpyInstance;
        let mockHasInvitationLimitReached: jest.SpyInstance;
        let mockIsEventDateInThePast: jest.SpyInstance;
        let mockIsRsvpDueDateAfterEventDate: jest.SpyInstance;

        beforeEach(() => {
            mockDoesUserHaveInvitationLimitCapabilities = jest.spyOn(
                CreateInvitationUseCase,
                'doesUserHaveInvitationLimitCapabilities',
            ).mockReturnValue(true);

            spyInvitationCreateNew = jest.spyOn(
                Invitation,
                'createNew',
            );

            mockHasInvitationLimitReached = jest.spyOn(
                useCase,
                'hasInvitationLimitReached',
            ).mockResolvedValue(false);

            mockIsEventDateInThePast = jest.spyOn(
                useCase,
                'isEventDateInThePast',
            ).mockReturnValue(false);

            mockIsRsvpDueDateAfterEventDate = jest.spyOn(
                useCase,
                'isRsvpDueDateAfterEventDate',
            ).mockReturnValue(false);

            mockInvitationRepository.create.mockResolvedValue(invitation);
        });

        it('should create an invitation successfully with valid props', async() => {
            const result = await useCase.execute(createInvitationDto, user);

            expect(mockDoesUserHaveInvitationLimitCapabilities).toHaveBeenCalledWith(
                user.capabilities!.invitationLimit,
            );

            expect(mockHasInvitationLimitReached).toHaveBeenCalledWith(
                userId,
                user.capabilities!.invitationLimit,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(createInvitationDto.date.gregorianDate);
            expect(mockIsRsvpDueDateAfterEventDate).toHaveBeenCalledWith(
                createInvitationDto.rsvpDueDate,
                createInvitationDto.date.gregorianDate,
            );

            expect(spyInvitationCreateNew).toHaveBeenCalledWith({
                userId,
                type: createInvitationDto.type,
                title: createInvitationDto.title,
                hosts: [
                    {
                        name: 'John Doe',
                        title: 'Groom',
                        relationshipWithCelebratedPerson: 'spouse',
                    },
                ],
                celebratedPersons: [
                    {
                        name: 'Jane Doe',
                        title: 'Bride',
                        relationshipWithHost: 'spouse',
                        celebrationDate: new Date('2025-06-15T00:00:00.000Z'),
                        type: 'bride',
                    },
                ],
                date: {
                    gregorianDate: new Date('2025-06-15T00:00:00.000Z'),
                    hijriDate: '1446-10-20',
                },
                location: createInvitationDto.location,
                itineraries: createInvitationDto.itineraries,
                contactPersons: [
                    {
                        name: 'Contact Person',
                        title: 'Wedding Coordinator',
                        relationshipWithCelebratedPerson: 'friend',
                        phoneNumber: '+1234567890',
                        whatsappNumber: '+1234567890',
                    },
                ],
                rsvpDueDate: new Date('2025-06-08T00:00:00.000Z'),
            });

            const invitationCreateNewResult = spyInvitationCreateNew.mock.results[0].value;

            expect(mockInvitationRepository.create).toHaveBeenCalledWith(invitationCreateNewResult);

            expect(result).toEqual(invitation);
        });

        it('should throw BadRequestException when user has no capabilities', async() => {
            const userWithoutCapabilities = UserFixture.getEntity({
                id: userId,
                capabilities: null,
            });

            mockDoesUserHaveInvitationLimitCapabilities.mockReturnValue(false);

            await expect(useCase.execute(
                createInvitationDto,
                userWithoutCapabilities,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.CAPABILITIES_NOT_FOUND),
            );

            expect(mockDoesUserHaveInvitationLimitCapabilities).toHaveBeenCalledWith(userWithoutCapabilities.capabilities?.invitationLimit);
            expect(mockHasInvitationLimitReached).not.toHaveBeenCalled();
            expect(mockIsEventDateInThePast).not.toHaveBeenCalled();
            expect(mockIsRsvpDueDateAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when user reaches invitation limit', async() => {
            mockHasInvitationLimitReached.mockResolvedValue(true);

            await expect(useCase.execute(
                createInvitationDto,
                user,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.LIMIT_REACHED),
            );

            expect(mockDoesUserHaveInvitationLimitCapabilities).toHaveBeenCalledWith(user.capabilities!.invitationLimit);
            expect(mockHasInvitationLimitReached).toHaveBeenCalledWith(
                userId,
                user.capabilities!.invitationLimit,
            );

            expect(mockIsEventDateInThePast).not.toHaveBeenCalled();
            expect(mockIsRsvpDueDateAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when event date is in the past', async() => {
            mockIsEventDateInThePast.mockReturnValue(true);

            await expect(useCase.execute(
                createInvitationDto,
                user,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.EVENT_DATE_IN_THE_PAST),
            );

            expect(mockDoesUserHaveInvitationLimitCapabilities).toHaveBeenCalledWith(user.capabilities!.invitationLimit);
            expect(mockHasInvitationLimitReached).toHaveBeenCalledWith(
                userId,
                user.capabilities!.invitationLimit,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(createInvitationDto.date.gregorianDate);
            expect(mockIsRsvpDueDateAfterEventDate).not.toHaveBeenCalled();
            expect(mockInvitationRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when RSVP due date is after event date', async() => {
            mockIsRsvpDueDateAfterEventDate.mockReturnValue(true);

            await expect(useCase.execute(
                createInvitationDto,
                user,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.RSVP_DUE_DATE_AFTER_EVENT_DATE),
            );

            expect(mockDoesUserHaveInvitationLimitCapabilities).toHaveBeenCalledWith(
                user.capabilities!.invitationLimit,
            );

            expect(mockHasInvitationLimitReached).toHaveBeenCalledWith(
                userId,
                user.capabilities!.invitationLimit,
            );

            expect(mockIsEventDateInThePast).toHaveBeenCalledWith(
                createInvitationDto.date.gregorianDate,
            );

            expect(mockIsRsvpDueDateAfterEventDate).toHaveBeenCalledWith(
                createInvitationDto.rsvpDueDate,
                createInvitationDto.date.gregorianDate,
            );

            expect(mockInvitationRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('#doesUserHaveInvitationLimitCapabilities', () => {
        it('should return true when user has invitation limit', () => {
            const result = CreateInvitationUseCase.doesUserHaveInvitationLimitCapabilities(1);
            expect(result).toBe(true);
        });

        it('should return false when user has undefined invitation limit', () => {
            const result = CreateInvitationUseCase.doesUserHaveInvitationLimitCapabilities(undefined);
            expect(result).toBe(false);
        });
    });

    describe('#hasInvitationLimitReached', () => {
        beforeEach(() => {
            mockInvitationRepository.countByUserId.mockResolvedValue(1);
        });

        it('should return true when user reaches invitation limit', async() => {
            const result = await useCase.hasInvitationLimitReached(
                userId,
                1,
            );

            expect(mockInvitationRepository.countByUserId).toHaveBeenCalledWith(
                userId,
            );

            expect(result).toBe(true);

        });

        it('should return false when user does not reach invitation limit', async() => {
            mockInvitationRepository.countByUserId.mockResolvedValue(0);

            const result = await useCase.hasInvitationLimitReached(
                userId,
                1,
            );

            expect(mockInvitationRepository.countByUserId).toHaveBeenCalledWith(
                userId,
            );

            expect(result).toBe(false);
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
