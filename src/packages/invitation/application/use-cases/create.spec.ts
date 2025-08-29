import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import {
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { CreateInvitationUseCase } from './create';
import { InvitationRepository } from '@invitation/infra/repository';
import { DateValidator } from '@common/utils/date';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import {
    InvitationType,
    RelationshipType,
    CelebratedPersonType
} from '@invitation/domain/entities/invitation';

describe('@invitation/application/use-cases/create', () => {
    let useCase: CreateInvitationUseCase;
    let mockRepository: jest.Mocked<InvitationRepository>;
    let mockDateValidator: jest.Mocked<DateValidator>;

    const user = UserFixture.getUserEntity({
        id: '000000000000000000000001',
        plan: UserFixture.getUserProps().plan,
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

    beforeEach(async () => {
        const mockInvitationRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            countByUserId: jest.fn(),
        };

        const mockDateValidatorInstance = {
            parseDate: jest.fn(),
            isPastDate: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInvitationUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: mockInvitationRepository,
                },
                {
                    provide: 'DateValidator',
                    useValue: mockDateValidatorInstance,
                },
            ],
        }).compile();

        useCase = module.get<CreateInvitationUseCase>(CreateInvitationUseCase);
        mockRepository = module.get('InvitationRepository');
        mockDateValidator = module.get('DateValidator');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create an invitation successfully with valid props', async () => {
            const invitation = InvitationFixture.getInvitationEntity({
                id: '000000000000000000000002',
                userId: '000000000000000000000001',
            });

            mockRepository.countByUserId.mockResolvedValue(0);
            mockRepository.create.mockResolvedValue(invitation);
            mockDateValidator.parseDate.mockReturnValue(DateTime.utc());
            mockDateValidator.isPastDate.mockReturnValue(false);

            const result = await useCase.execute(createInvitationDto, user);

            expect(mockRepository.countByUserId).toHaveBeenCalledWith('000000000000000000000001');
            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: '000000000000000000000001',
                    type: createInvitationDto.type,
                    title: createInvitationDto.title,
                    hosts: createInvitationDto.hosts,
                    celebratedPersons: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Jane Doe',
                            celebrationDate: expect.any(Date),
                        }),
                    ]),
                    date: expect.objectContaining({
                        gregorianDate: expect.any(Date),
                        hijriDate: createInvitationDto.date.hijriDate,
                    }),
                    location: createInvitationDto.location,
                    itineraries: expect.arrayContaining([
                        expect.objectContaining({
                            activities: ['Reception', 'Dinner', 'Dancing'],
                            startTime: '18:00',
                            endTime: '23:00',
                        }),
                    ]),
                    contactPersons: createInvitationDto.contactPersons,
                    rsvpDueDate: expect.any(Date),
                }),
            );

            expect(result).toEqual(invitation);
        });

        it('should throw ForbiddenException when user reaches invitation limit', async () => {
            mockRepository.countByUserId.mockResolvedValue(1); // User already has 1 invitation (basic package limit)
            mockDateValidator.parseDate.mockReturnValue(DateTime.utc());
            mockDateValidator.isPastDate.mockReturnValue(false);

            await expect(useCase.execute(createInvitationDto, user)).rejects.toThrow(ForbiddenException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when RSVP due date is after event date', async () => {
            mockRepository.countByUserId.mockResolvedValue(0);

            // Mock the date validator to return the actual dates for comparison
            const eventDate = DateTime.fromISO('2025-06-15T00:00:00.000Z');
            const rsvpDate = DateTime.fromISO('2025-06-20T00:00:00.000Z'); // After event date

            mockDateValidator.parseDate
                .mockReturnValueOnce(eventDate) // For event date
                .mockReturnValueOnce(rsvpDate); // For RSVP date
            mockDateValidator.isPastDate.mockReturnValue(false);

            const invalidDto = {
                ...createInvitationDto,
                rsvpDueDate: '2025-06-20T00:00:00.000Z', // After event date
            };

            await expect(useCase.execute(invalidDto, user)).rejects.toThrow(BadRequestException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when event date is in the past', async () => {
            mockRepository.countByUserId.mockResolvedValue(0);
            mockDateValidator.parseDate.mockReturnValue(DateTime.utc());
            mockDateValidator.isPastDate.mockReturnValue(true);

            await expect(useCase.execute(createInvitationDto, user)).rejects.toThrow(BadRequestException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('validateDates', () => {
        it('should throw BadRequestException when event date is in the past', () => {
            const pastDate = DateTime.fromISO('2020-01-01T00:00:00.000Z');
            const futureDate = DateTime.fromISO('2025-06-08T00:00:00.000Z');

            mockDateValidator.parseDate.mockReturnValue(pastDate);
            mockDateValidator.isPastDate.mockReturnValue(true);

            const invitation = InvitationFixture.getInvitationEntity({
                id: '000000000000000000000002',
                userId: '000000000000000000000001',
                date: {
                    gregorianDate: pastDate.toJSDate(),
                    hijriDate: null,
                },
                rsvpDueDate: futureDate.toJSDate(),
            });

            expect(() => {
                useCase.validateDates(invitation);
            }).toThrow(BadRequestException);
        });

        it('should throw BadRequestException when RSVP due date is after event date', () => {
            const eventDate = DateTime.fromISO('2025-06-15T00:00:00.000Z');
            const laterRsvpDate = DateTime.fromISO('2025-06-20T00:00:00.000Z');

            mockDateValidator.parseDate
                .mockReturnValueOnce(eventDate) // For event date
                .mockReturnValueOnce(laterRsvpDate); // For RSVP date
            mockDateValidator.isPastDate.mockReturnValue(false);

            const invitation = InvitationFixture.getInvitationEntity({
                id: '000000000000000000000002',
                userId: '000000000000000000000001',
                date: {
                    gregorianDate: eventDate.toJSDate(),
                    hijriDate: null,
                },
                rsvpDueDate: laterRsvpDate.toJSDate(),
            });

            expect(() => {
                useCase.validateDates(invitation);
            }).toThrow(BadRequestException);
        });
    });
});
