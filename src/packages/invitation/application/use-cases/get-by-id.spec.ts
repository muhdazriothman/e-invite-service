import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { InvitationRepository } from '@invitation/infra/repository';
import { NotFoundException } from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { invitationErrors } from '@shared/constants/error-codes';
import { InvitationFixture } from '@test/fixture/invitation';


describe('@invitation/application/use-cases/get-by-id', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000001';

    let useCase: GetInvitationByIdUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;

    const invitation = InvitationFixture.getEntity({
        id: invitationId,
        userId,
    });

    beforeEach(async() => {
        const invitationRepository = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetInvitationByIdUseCase,
                {
                    provide: 'InvitationRepository',
                    useValue: invitationRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetInvitationByIdUseCase>(GetInvitationByIdUseCase);
        mockInvitationRepository = module.get('InvitationRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('#execute', () => {
        it('should return invitation when found', async() => {
            mockInvitationRepository.findById.mockResolvedValue(invitation);

            const result = await useCase.execute(
                invitationId,
                userId,
            );

            expect(mockInvitationRepository.findById).toHaveBeenCalledWith(
                invitationId,
                userId,
            );

            expect(result).toEqual(invitation);
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
        });
    });
});
