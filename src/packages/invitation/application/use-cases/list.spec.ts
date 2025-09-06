import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { PaginationResult } from '@shared/domain/value-objects/pagination-result';
import { InvitationFixture } from '@test/fixture/invitation';

import { ListInvitationsUseCase } from './list';

describe('@invitation/application/use-cases/list', () => {
  let useCase: ListInvitationsUseCase;
  let invitationRepository: jest.Mocked<InvitationRepository>;

  beforeEach(async() => {
    const mockInvitationRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllWithPagination: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListInvitationsUseCase,
        {
          provide: 'InvitationRepository',
          useValue: mockInvitationRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListInvitationsUseCase>(ListInvitationsUseCase);
    invitationRepository = module.get('InvitationRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated invitations from repository', async() => {
      const mockInvitations = [
        InvitationFixture.getEntity({
          id: '000000000000000000000001',
          title: 'Wedding Celebration 1',
        }),
        InvitationFixture.getEntity({
          id: '000000000000000000000002',
        }),
      ];

      const mockPaginationResult = PaginationResult.create(
        mockInvitations,
        '000000000000000000000002',
        '000000000000000000000001',
        true,
        false,
      );

      invitationRepository.findAllWithPagination.mockResolvedValue(
        mockPaginationResult,
      );

      const result = await useCase.execute('user123');

      expect(invitationRepository.findAllWithPagination).toHaveBeenCalledWith(
        'user123',
        undefined,
        undefined,
        20,
      );
      expect(result).toEqual(mockPaginationResult);
    });

    it('should return paginated invitations with next cursor and limit', async() => {
      const mockInvitations = [
        InvitationFixture.getEntity({
          id: '3',
          title: 'Wedding Celebration 3',
        }),
      ];

      const mockPaginationResult = PaginationResult.create(
        mockInvitations,
        undefined,
        '000000000000000000000002',
        false,
        true,
      );

      invitationRepository.findAllWithPagination.mockResolvedValue(
        mockPaginationResult,
      );

      const result = await useCase.execute(
        'user123',
        '000000000000000000000002',
        undefined,
        10,
      );

      expect(invitationRepository.findAllWithPagination).toHaveBeenCalledWith(
        'user123',
        '000000000000000000000002',
        undefined,
        10,
      );
      expect(result).toEqual(mockPaginationResult);
    });

    it('should return paginated invitations with previous cursor and limit', async() => {
      const mockInvitations = [
        InvitationFixture.getEntity({
          id: '1',
          title: 'Wedding Celebration 1',
        }),
      ];

      const mockPaginationResult = PaginationResult.create(
        mockInvitations,
        '000000000000000000000002',
        undefined,
        true,
        false,
      );

      invitationRepository.findAllWithPagination.mockResolvedValue(
        mockPaginationResult,
      );

      const result = await useCase.execute(
        'user123',
        undefined,
        '000000000000000000000001',
        10,
      );

      expect(invitationRepository.findAllWithPagination).toHaveBeenCalledWith(
        'user123',
        undefined,
        '000000000000000000000001',
        10,
      );
      expect(result).toEqual(mockPaginationResult);
    });
  });
});
