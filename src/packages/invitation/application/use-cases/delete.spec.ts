import { InvitationRepository } from '@invitation/infra/repository';
import { NotFoundException } from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { InvitationFixture } from '@test/fixture/invitation';

import { DeleteInvitationUseCase } from './delete';

describe('@invitation/application/use-cases/delete', () => {
  let useCase: DeleteInvitationUseCase;
  let invitationRepository: jest.Mocked<InvitationRepository>;

  const mockInvitation = InvitationFixture.getEntity();

  beforeEach(async() => {
    const mockInvitationRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteInvitationUseCase,
        {
          provide: 'InvitationRepository',
          useValue: mockInvitationRepository,
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
    it('should delete invitation successfully', async() => {
      const invitationId = 'invitation-id-1';
      const userId = '000000000000000000000001';

      invitationRepository.findById.mockResolvedValue(mockInvitation);
      invitationRepository.delete.mockResolvedValue(true);

      await expect(
        useCase.execute(invitationId, userId),
      ).resolves.toBeUndefined();

      expect(invitationRepository.findById).toHaveBeenCalledWith(
        invitationId,
        userId,
      );
      expect(invitationRepository.delete).toHaveBeenCalledWith(
        invitationId,
        userId,
      );
    });

    it('should throw NotFoundException when invitation not found', async() => {
      const invitationId = 'non-existent-id';
      const userId = '000000000000000000000001';

      invitationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(invitationId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(invitationRepository.findById).toHaveBeenCalledWith(
        invitationId,
        userId,
      );
      expect(invitationRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete operation fails', async() => {
      const invitationId = 'invitation-id-1';
      const userId = '000000000000000000000001';

      invitationRepository.findById.mockResolvedValue(mockInvitation);
      invitationRepository.delete.mockResolvedValue(false);

      await expect(useCase.execute(invitationId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(invitationRepository.findById).toHaveBeenCalledWith(
        invitationId,
        userId,
      );
      expect(invitationRepository.delete).toHaveBeenCalledWith(
        invitationId,
        userId,
      );
    });
  });
});
