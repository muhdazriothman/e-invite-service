import { InvitationService } from '@invitation/application/services/invitation';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import {
    CelebratedPersonType,
    Invitation,
    InvitationType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import {
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { invitationErrors } from '@shared/constants/error-codes';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@invitation/application/use-cases/create', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000002';

    let useCase: CreateInvitationUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;
    let mockInvitationService: jest.Mocked<InvitationService>;

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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInvitationUseCase,
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

        useCase = module.get<CreateInvitationUseCase>(CreateInvitationUseCase);
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
        let mockvalidateInvitationLimitCapabilities: jest.SpyInstance;
        let mockValidateInvitationLimitReached: jest.SpyInstance;
        let mockValidateEventDateIsFuture: jest.SpyInstance;
        let mockValidateRsvpDueDateNotAfterEventDate: jest.SpyInstance;
        let spyInvitationCreateNew: jest.SpyInstance;

        beforeEach(() => {
            mockvalidateInvitationLimitCapabilities = jest.spyOn(
                CreateInvitationUseCase,
                'validateInvitationLimitCapabilities',
            ).mockReturnValue();

            mockValidateInvitationLimitReached = jest.spyOn(
                useCase,
                'validateInvitationLimitReached',
            ).mockResolvedValue();

            mockValidateEventDateIsFuture = jest.spyOn(
                mockInvitationService,
                'validateEventDateIsFuture',
            ).mockReturnValue();

            mockValidateRsvpDueDateNotAfterEventDate = jest.spyOn(
                mockInvitationService,
                'validateRsvpDueDateNotAfterEventDate',
            ).mockReturnValue();

            spyInvitationCreateNew = jest.spyOn(
                Invitation,
                'createNew',
            );

            mockInvitationRepository.create.mockResolvedValue(invitation);
        });

        it('should create invitation successfully', async () => {
            const result = await useCase.execute(
                user,
                createInvitationDto,
            );

            expect(mockvalidateInvitationLimitCapabilities).toHaveBeenCalledWith(
                user.capabilities!.invitationLimit,
            );

            expect(mockValidateInvitationLimitReached).toHaveBeenCalledWith(
                userId,
                user.capabilities!.invitationLimit,
            );

            expect(mockValidateEventDateIsFuture).toHaveBeenCalledWith(
                createInvitationDto.date.gregorianDate,
            );

            expect(mockValidateRsvpDueDateNotAfterEventDate).toHaveBeenCalledWith(
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

            expect(mockInvitationRepository.create).toHaveBeenCalledWith(
                invitationCreateNewResult,
            );

            expect(result).toEqual(invitation);
        });

        it('should handle BadRequestException', async () => {
            const userWithoutCapabilities = UserFixture.getEntity();

            mockvalidateInvitationLimitCapabilities.mockImplementation(
                () => {
                    throw new BadRequestException(
                        invitationErrors.CAPABILITIES_NOT_FOUND,
                    );
                },
            );

            await expect(useCase.execute(
                userWithoutCapabilities,
                createInvitationDto,
            )).rejects.toThrow(
                new BadRequestException(invitationErrors.CAPABILITIES_NOT_FOUND),
            );
        });

        it('should handle unexpected error', async () => {
            mockInvitationRepository.create.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(
                user,
                createInvitationDto,
            )).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });

    describe('#validateInvitationLimitCapabilities', () => {
        it('should not throw when invitation limit is greater than 0', () => {
            expect(() =>
                CreateInvitationUseCase.validateInvitationLimitCapabilities(
                    1,
                ),
            ).not.toThrow();
        });

        it('should throw BadRequestException when invitation limit is undefined', () => {
            expect(() =>
                CreateInvitationUseCase.validateInvitationLimitCapabilities(
                    undefined,
                ),
            ).toThrow(
                new BadRequestException(
                    invitationErrors.CAPABILITIES_NOT_FOUND,
                ),
            );
        });
    });

    describe('#validateInvitationLimitReached', () => {
        beforeEach(() => {
            mockInvitationRepository.countByUserId.mockResolvedValue(1);
        });

        it('should not throw when invitation limit is reached', async () => {
            await expect(useCase.validateInvitationLimitReached(
                userId,
                3,
            )).resolves.toBeUndefined();

            expect(mockInvitationRepository.countByUserId).toHaveBeenCalledWith(
                userId,
            );
        });

        it('should throw BadRequestException when user reaches invitation limit', async () => {
            mockInvitationRepository.countByUserId.mockResolvedValue(1);

            await expect(useCase.validateInvitationLimitReached(
                userId,
                1,
            )).rejects.toThrow(
                new BadRequestException(
                    invitationErrors.LIMIT_REACHED,
                ),
            );

            expect(mockInvitationRepository.countByUserId).toHaveBeenCalledWith(
                userId,
            );
        });
    });
});
