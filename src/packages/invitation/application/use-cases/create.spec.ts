import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateInvitationUseCase } from './create';
import { InvitationRepository } from '@invitation/infra/repository';
import { DateValidator } from '@common/utils/date';
import { InvitationFixture } from '@test/fixture/invitation';

describe('@invitation/application/use-cases/create', () => {
    let useCase: CreateInvitationUseCase;
    let mockRepository: jest.Mocked<InvitationRepository>;
    let dateValidator: DateValidator;

    const FIXED_DATE = new Date('2024-01-15T12:00:00.000Z');
    const createInvitationDto = InvitationFixture.getCreateInvitationDto();

    beforeEach(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(FIXED_DATE);

        const mockInvitationRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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
                    useFactory: () => new DateValidator(),
                },
            ],
        }).compile();

        useCase = module.get<CreateInvitationUseCase>(CreateInvitationUseCase);
        mockRepository = module.get('InvitationRepository');
        dateValidator = module.get('DateValidator');
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const invitation = InvitationFixture.getInvitationEntity();

        it('should create an invitation successfully with valid dto', async () => {
            // Use fixed future dates relative to our fixed reference date
            const futureEventDate = new Date('2025-06-15T00:00:00.000Z');
            const futureRsvpDate = new Date('2025-06-08T00:00:00.000Z'); // 7 days before event

            const validDto = {
                ...createInvitationDto,
                date: {
                    ...createInvitationDto.date,
                    gregorianDate: futureEventDate.toISOString(),
                },
                rsvpDueDate: futureRsvpDate.toISOString(),
                celebratedPersons: [
                    {
                        ...createInvitationDto.celebratedPersons[0],
                        celebrationDate: futureEventDate.toISOString(),
                    },
                ],
                itineraries: [
                    {
                        ...createInvitationDto.itineraries[0],
                        startTime: '18:00', // Time-only string
                        endTime: '23:00',   // Time-only string
                    },
                ],
            };

            mockRepository.create.mockResolvedValue(invitation);

            const result = await useCase.execute(validDto);

            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: validDto.type,
                    title: validDto.title,
                    hosts: validDto.hosts,
                    celebratedPersons: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Jane Doe',
                            celebrationDate: expect.any(Date),
                        }),
                    ]),
                    date: expect.objectContaining({
                        gregorianDate: expect.any(Date),
                        hijriDate: validDto.date.hijriDate,
                    }),
                    location: validDto.location,
                    itineraries: expect.arrayContaining([
                        expect.objectContaining({
                            activities: ['Reception', 'Dinner', 'Dancing'],
                            startTime: '18:00',
                            endTime: '23:00',
                        }),
                    ]),
                    contactPersons: validDto.contactPersons,
                    rsvpDueDate: expect.any(Date),
                }),
            );

            expect(result).toEqual(invitation);
        });

        it('should throw BadRequestException validation failed', async () => {
            const futureEventDate = new Date('2025-06-15T00:00:00.000Z');
            const laterRsvpDate = new Date('2025-06-20T00:00:00.000Z'); // After event date

            const invalidDto = {
                ...createInvitationDto,
                date: {
                    ...createInvitationDto.date,
                    gregorianDate: futureEventDate.toISOString(),
                },
                rsvpDueDate: laterRsvpDate.toISOString(),
            };

            await expect(useCase.execute(invalidDto)).rejects.toThrow(BadRequestException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when event date is in the past', async () => {
            const pastEventDate = new Date('2023-06-15T00:00:00.000Z'); // Before fixed date
            const futureRsvpDate = new Date('2023-06-08T00:00:00.000Z');

            const invalidDto = {
                ...createInvitationDto,
                date: {
                    ...createInvitationDto.date,
                    gregorianDate: pastEventDate.toISOString(),
                },
                rsvpDueDate: futureRsvpDate.toISOString(),
            };

            await expect(useCase.execute(invalidDto)).rejects.toThrow(BadRequestException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('validateDates', () => {
        it('should throw BadRequestException when event date is in the past', async () => {
            const pastEventDate = new Date('2023-06-15T00:00:00.000Z');
            const futureRsvpDate = new Date('2023-06-08T00:00:00.000Z');

            const invalidDto = {
                ...createInvitationDto,
                date: {
                    ...createInvitationDto.date,
                    gregorianDate: pastEventDate.toISOString(),
                },
                rsvpDueDate: futureRsvpDate.toISOString(),
            };

            await expect(useCase.execute(invalidDto)).rejects.toThrow(BadRequestException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when RSVP due date is after event date', async () => {
            const futureEventDate = new Date('2025-06-15T00:00:00.000Z');
            const laterRsvpDate = new Date('2025-06-20T00:00:00.000Z'); // After event date

            const invalidDto = {
                ...createInvitationDto,
                date: {
                    ...createInvitationDto.date,
                    gregorianDate: futureEventDate.toISOString(),
                },
                rsvpDueDate: laterRsvpDate.toISOString(),
            };

            await expect(useCase.execute(invalidDto)).rejects.toThrow(BadRequestException);
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
    });
});
