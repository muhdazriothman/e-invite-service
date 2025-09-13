import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { InvitationRepository } from '@invitation/infra/repository';
import { NotFoundException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { invitationErrors } from '@shared/constants/error-codes';
import { InvitationFixture } from '@test/fixture/invitation';


describe('@invitation/application/use-cases/delete', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000001';

    let useCase: DeleteInvitationUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;

    const invitation = InvitationFixture.getEntity({
        id: invitationId,
        userId,
    });

    beforeEach(async() => {
        const invitationRepository = {
            findById: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteInvitationUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: invitationRepository,
                },
            ],
        }).compile();

        useCase = module.get<DeleteInvitationUseCase>(DeleteInvitationUseCase);
        mockInvitationRepository = module.get('InvitationRepository');
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
            mockInvitationRepository.findById.mockResolvedValue(invitation);
            mockInvitationRepository.delete.mockResolvedValue(true);
        });

        it('should delete invitation successfully', async() => {
            await expect(useCase.execute(
                invitationId,
                userId,
            ),
            ).resolves.toBeUndefined();

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.delete).toHaveBeenCalledWith(
                invitationId,
                userId,
            );
        });

        it('should throw NotFoundException when invitation not found', async() => {
            const invitationId = 'non-existent-id';

            mockInvitationRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(
                invitationId,
                userId,
            )).rejects.toThrow(
                new NotFoundException(invitationErrors.INVITATION_NOT_FOUND),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when delete operation fails', async() => {
            mockInvitationRepository.findById.mockResolvedValue(invitation);
            mockInvitationRepository.delete.mockResolvedValue(false);

            await expect(useCase.execute(
                invitationId,
                userId,
            )).rejects.toThrow(
                new NotFoundException(invitationErrors.FAILED_TO_DELETE_INVITATION),
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.delete).toHaveBeenCalledWith(
                invitationId,
                userId,
            );
        });
    });
});
