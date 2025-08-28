import { Test, TestingModule } from '@nestjs/testing';
import { ListInvitationsUseCase } from './list';
import { InvitationRepository } from '@invitation/infra/repository';
import { InvitationFixture } from '@test/fixture/invitation';

describe('@invitation/application/use-cases/list', () => {
    let useCase: ListInvitationsUseCase;
    let invitationRepository: jest.Mocked<InvitationRepository>;

    beforeEach(async () => {
        const mockInvitationRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
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
        it('should return all invitations from repository', async () => {
            const mockInvitations = [
                InvitationFixture.getInvitationEntity({
                    id: '1',
                    title: 'Wedding Celebration 1',
                }),
                InvitationFixture.getInvitationEntity({
                    id: '2',
                    title: 'Wedding Celebration 2',
                }),
            ];

            invitationRepository.findAll.mockResolvedValue(mockInvitations);

            const result = await useCase.execute();

            expect(invitationRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockInvitations);
        });

        it('should return empty array when no invitations exist', async () => {
            invitationRepository.findAll.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(invitationRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });
    });
});
