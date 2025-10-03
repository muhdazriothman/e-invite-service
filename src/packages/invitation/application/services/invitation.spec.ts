import { InvitationService } from '@invitation/application/services/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
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
import { createMock } from '@test/utils/mocks';
import { DateTime } from 'luxon';

describe('@invitation/application/services/invitation', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000002';

    let service: InvitationService;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;
    let mockDateValidator: {
        parseDate: jest.SpyInstance;
        isValidFormat: jest.SpyInstance;
    };
    let spyIsOnOrBeforeDate: jest.SpyInstance;

    const invitation = InvitationFixture.getEntity({
        id: invitationId,
        userId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InvitationService,
                {
                    provide: InvitationRepository,
                    useValue: createMock<InvitationRepository>(),
                },
                {
                    provide: DateValidator,
                    useValue: createMock<DateValidator>(),
                },
            ],
        }).compile();

        service = module.get<InvitationService>(InvitationService);
        mockInvitationRepository = module.get(InvitationRepository);
        mockDateValidator = module.get(DateValidator);
        spyIsOnOrBeforeDate = jest.spyOn(DateValidator, 'isOnOrBeforeDate');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('#findByIdOrFail', () => {
        beforeEach(() => {
            mockInvitationRepository.findById.mockResolvedValue(invitation);
        });

        it('should find invitation by id successfully', async () => {
            const result = await service.findByIdOrFail(invitationId);

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
            );

            expect(result).toEqual(invitation);
        });

        it('should throw NotFoundException when invitation is not found', async () => {
            mockInvitationRepository.findById.mockResolvedValue(null);

            await expect(service.findByIdOrFail(invitationId)).rejects.toThrow(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
            );
        });
    });

    describe('#findByIdAndUserOrFail', () => {
        beforeEach(() => {
            mockInvitationRepository.findByIdAndUserId.mockResolvedValue(invitation);
        });

        it('should find invitation by id and user successfully', async () => {
            const result = await service.findByIdAndUserIdOrFail(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.findByIdAndUserId).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(result).toEqual(invitation);
        });

        it('should throw NotFoundException', async () => {
            mockInvitationRepository.findByIdAndUserId.mockResolvedValue(null);

            await expect(service.findByIdAndUserIdOrFail(
                invitationId,
                userId,
            )).rejects.toThrow(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );
        });
    });

    describe('#validateEventDateIsFuture', () => {
        const eventDate = '2026-01-01T00:00:00.000Z';
        const parsedDate = DateTime.fromISO(eventDate);

        beforeEach(() => {
            mockDateValidator.parseDate.mockReturnValue(parsedDate);
            spyIsOnOrBeforeDate.mockReturnValue(false);
        });

        it('should not throw when event date is in the future', () => {
            expect(() => service.validateEventDateIsFuture(
                eventDate,
            )).not.toThrow();

            expect(mockDateValidator.parseDate).toHaveBeenCalledWith(eventDate);
            expect(spyIsOnOrBeforeDate).toHaveBeenCalledWith(
                parsedDate,
                expect.any(DateTime),
            );
        });

        it('should throw BadRequestException when event date is in the past', () => {
            spyIsOnOrBeforeDate.mockReturnValue(true);

            expect(() => service.validateEventDateIsFuture(
                eventDate,
            )).toThrow(
                new BadRequestException(
                    invitationErrors.EVENT_DATE_IN_THE_PAST,
                ),
            );

            expect(mockDateValidator.parseDate).toHaveBeenCalledWith(eventDate);

            const parsedEventDate = mockDateValidator.parseDate.mock.results[0].value;
            expect(spyIsOnOrBeforeDate).toHaveBeenCalledWith(
                parsedEventDate,
                expect.any(DateTime),
            );
        });
    });

    describe('#validateRsvpDueDateNotAfterEventDate', () => {
        const eventDate = '2025-06-15T00:00:00.000Z';
        const parsedEventDate = DateTime.fromISO(eventDate);

        it('should not throw when RSVP due date is before event date', () => {
            const rsvpDate = '2025-06-10T00:00:00.000Z';
            const parsedRsvpDate = DateTime.fromISO(rsvpDate);

            mockDateValidator.parseDate
                .mockReturnValueOnce(parsedRsvpDate)
                .mockReturnValueOnce(parsedEventDate);

            spyIsOnOrBeforeDate.mockReturnValue(true);

            expect(() => service.validateRsvpDueDateNotAfterEventDate(
                rsvpDate,
                eventDate,
            )).not.toThrow();

            expect(mockDateValidator.parseDate).toHaveBeenCalledTimes(2);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(1, rsvpDate);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(2, eventDate);
        });

        it('should throw BadRequestException when RSVP due date is after event date', () => {
            const rsvpDate = '2025-06-20T00:00:00.000Z';
            const parsedRsvpDate = DateTime.fromISO(rsvpDate);

            mockDateValidator.parseDate
                .mockReturnValueOnce(parsedRsvpDate)
                .mockReturnValueOnce(parsedEventDate);

            spyIsOnOrBeforeDate.mockReturnValue(false);

            expect(() => service.validateRsvpDueDateNotAfterEventDate(
                rsvpDate,
                eventDate,
            )).toThrow(
                new BadRequestException(
                    invitationErrors.RSVP_DUE_DATE_AFTER_EVENT_DATE,
                ),
            );

            expect(mockDateValidator.parseDate).toHaveBeenCalledTimes(2);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(1, rsvpDate);
            expect(mockDateValidator.parseDate).toHaveBeenNthCalledWith(2, eventDate);
        });
    });
});
