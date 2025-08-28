import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteInvitationUseCase } from './delete';
import { InvitationRepository } from '@invitation/infra/repository';
import { InvitationFixture } from '@test/fixture/invitation';

describe('@invitation/application/use-cases/delete', () => {
    let useCase: DeleteInvitationUseCase;
    let invitationRepository: jest.Mocked<InvitationRepository>;

    const mockInvitation = InvitationFixture.getInvitationEntity({
        id: 'invitation-id-1',
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteInvitationUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: {
                        findById: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<DeleteInvitationUseCase>(DeleteInvitationUseCase);
        invitationRepository = module.get('InvitationRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should delete invitation successfully', async () => {
            const invitationId = 'invitation-id-1';

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.delete.mockResolvedValue(true);

            await expect(useCase.execute(invitationId)).resolves.toBeUndefined();

            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(invitationRepository.delete).toHaveBeenCalledWith(invitationId);
        });

        it('should throw NotFoundException when invitation not found', async () => {
            const invitationId = 'non-existent-id';

            invitationRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(invitationId)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(invitationRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when delete operation fails', async () => {
            const invitationId = 'invitation-id-1';

            invitationRepository.findById.mockResolvedValue(mockInvitation);
            invitationRepository.delete.mockResolvedValue(false);

            await expect(useCase.execute(invitationId)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(invitationRepository.delete).toHaveBeenCalledWith(invitationId);
        });
    });
});
