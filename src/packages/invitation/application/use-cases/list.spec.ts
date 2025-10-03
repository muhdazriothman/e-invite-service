import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaginationResult } from '@shared/domain/value-objects/pagination-result';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@invitation/application/use-cases/list', () => {
    const userId = '000000000000000000000001';

    let useCase: ListInvitationsUseCase;
    let mockInvitationRepository: jest.Mocked<InvitationRepository>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListInvitationsUseCase,
                {
                    provide: InvitationRepository,
                    useValue: createMock<InvitationRepository>(),
                },
            ],
        }).compile();

        useCase = module.get<ListInvitationsUseCase>(ListInvitationsUseCase);
        mockInvitationRepository = module.get(InvitationRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return paginated invitations from repository', async () => {
            const invitations = [
                InvitationFixture.getEntity({
                    id: '000000000000000000000001',
                    title: 'Wedding Celebration 1',
                }),
                InvitationFixture.getEntity({
                    id: '000000000000000000000002',
                }),
            ];

            const paginationResult = PaginationResult.create(
                invitations,
                '000000000000000000000002',
                '000000000000000000000001',
                true,
                false,
            );

            mockInvitationRepository.findAllWithPagination.mockResolvedValue(
                paginationResult,
            );

            const result = await useCase.execute(user);

            expect(mockInvitationRepository.findAllWithPagination).toHaveBeenCalledWith(
                user.id,
                undefined,
                undefined,
                20,
            );

            expect(result).toEqual(paginationResult);
        });

        it('should return paginated invitations with next cursor and limit', async () => {
            const invitations = [
                InvitationFixture.getEntity({
                    id: '3',
                    title: 'Wedding Celebration 3',
                }),
            ];

            const paginationResult = PaginationResult.create(
                invitations,
                undefined,
                '000000000000000000000002',
                false,
                true,
            );

            mockInvitationRepository.findAllWithPagination.mockResolvedValue(
                paginationResult,
            );

            const result = await useCase.execute(
                user,
                '000000000000000000000002',
                undefined,
                10,
            );

            expect(mockInvitationRepository.findAllWithPagination).toHaveBeenCalledWith(
                user.id,
                '000000000000000000000002',
                undefined,
                10,
            );
            expect(result).toEqual(paginationResult);
        });

        it('should return paginated invitations with previous cursor and limit', async () => {
            const invitations = [
                InvitationFixture.getEntity({
                    id: '1',
                    title: 'Wedding Celebration 1',
                }),
            ];

            const paginationResult = PaginationResult.create(
                invitations,
                '000000000000000000000002',
                undefined,
                true,
                false,
            );

            mockInvitationRepository.findAllWithPagination.mockResolvedValue(
                paginationResult,
            );

            const result = await useCase.execute(
                user,
                undefined,
                '000000000000000000000001',
                10,
            );

            expect(mockInvitationRepository.findAllWithPagination).toHaveBeenCalledWith(
                user.id,
                undefined,
                '000000000000000000000001',
                10,
            );
            expect(result).toEqual(paginationResult);
        });
    });
});
