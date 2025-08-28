import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetInvitationByIdUseCase } from './get-by-id';
import { InvitationRepository } from '@invitation/infra/repository';
import { InvitationFixture } from '@test/fixture/invitation';

describe('@invitation/application/use-cases/get-by-id', () => {
    let useCase: GetInvitationByIdUseCase;
    let invitationRepository: jest.Mocked<InvitationRepository>;

    const mockInvitation = InvitationFixture.getInvitationEntity({
        id: 'invitation-id-1',
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetInvitationByIdUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<GetInvitationByIdUseCase>(GetInvitationByIdUseCase);
        invitationRepository = module.get('InvitationRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return invitation when found', async () => {
            const invitationId = 'invitation-id-1';
            invitationRepository.findById.mockResolvedValue(mockInvitation);

            const result = await useCase.execute(invitationId);

            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
            expect(result).toEqual(mockInvitation);
        });

        it('should throw NotFoundException when invitation not found', async () => {
            const invitationId = 'non-existent-id';
            invitationRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(invitationId)).rejects.toThrow(
                NotFoundException,
            );
            expect(invitationRepository.findById).toHaveBeenCalledWith(invitationId);
        });
    });
});
