import { InvitationService } from '@invitation/application/services/invitation';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import {
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

describe('@invitation/application/use-cases/get-by-id', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000001';

    let useCase: GetInvitationByIdUseCase;
    let mockInvitationService: jest.Mocked<InvitationService>;

    const invitation = InvitationFixture.getEntity({
        id: invitationId,
        userId,
    });

    const user = UserFixture.getEntity({
        id: userId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetInvitationByIdUseCase,
                {
                    provide: InvitationService,
                    useValue: createMock<InvitationService>(),
                },
            ],
        }).compile();

        useCase = module.get<GetInvitationByIdUseCase>(GetInvitationByIdUseCase);
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
        });

        it('should return invitation when found', async () => {
            const result = await useCase.execute(
                user,
                invitationId,
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(result).toEqual(invitation);
        });

        it('should handle NotFoundException', async () => {
            const invitationId = 'non-existent-id';

            mockInvitationService.findByIdAndUserIdOrFail.mockRejectedValue(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            await expect(useCase.execute(
                user,
                invitationId,
            )).rejects.toThrow(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );
        });

        it('should throw unexpected error', async () => {
            mockInvitationService.findByIdAndUserIdOrFail.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(user, invitationId)).rejects.toThrow(
                new InternalServerErrorException(new Error('Unexpected error')),
            );

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );
        });
    });
});
