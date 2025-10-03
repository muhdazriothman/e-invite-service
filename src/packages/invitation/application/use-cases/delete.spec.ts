import { InvitationService } from '@invitation/application/services/invitation';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { InvitationRepository } from '@invitation/infra/repository';
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

describe('@invitation/application/use-cases/delete', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000001';

    let useCase: DeleteInvitationUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;
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
                DeleteInvitationUseCase,
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

        useCase = module.get<DeleteInvitationUseCase>(DeleteInvitationUseCase);
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
            mockInvitationRepository.deleteByIdAndUserId.mockResolvedValue(true);
        });

        it('should delete invitation successfully', async () => {
            await expect(useCase.execute(
                user,
                invitationId,
            )).resolves.toBeUndefined();

            expect(mockInvitationService.findByIdAndUserIdOrFail).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.deleteByIdAndUserId).toHaveBeenCalledWith(
                invitationId,
                userId,
            );
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

            expect(mockInvitationRepository.deleteByIdAndUserId).not.toHaveBeenCalled();
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

            expect(mockInvitationRepository.deleteByIdAndUserId).not.toHaveBeenCalled();
        });
    });
});
