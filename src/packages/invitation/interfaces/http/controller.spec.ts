import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { InvitationController } from '@invitation/interfaces/http/controller';
import { InvitationMapper } from '@invitation/interfaces/http/mapper';
import { RequestWithUser } from '@invitation/interfaces/http/middleware/user-context.middleware';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaginationResult } from '@shared/domain/value-objects/pagination-result';
import { InvitationFixture } from '@test/fixture/invitation';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@invitation/interfaces/http/controller', () => {
    const userId = '000000000000000000000001';
    const invitationId = '000000000000000000000002';

    let controller: InvitationController;
    let createInvitationUseCase: jest.Mocked<CreateInvitationUseCase>;
    let listInvitationsUseCase: jest.Mocked<ListInvitationsUseCase>;
    let getInvitationByIdUseCase: jest.Mocked<GetInvitationByIdUseCase>;
    let updateInvitationUseCase: jest.Mocked<UpdateInvitationUseCase>;
    let deleteInvitationUseCase: jest.Mocked<DeleteInvitationUseCase>;

    const user = UserFixture.getEntity({
        id: userId,
    });

    const invitation = InvitationFixture.getEntity({
        id: invitationId,
    });

    const mockRequest: RequestWithUser = {
        user: { id: userId },
        userData: user,
    } as RequestWithUser;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InvitationController],
            providers: [
                {
                    provide: CreateInvitationUseCase,
                    useValue: createMock<CreateInvitationUseCase>(),
                },
                {
                    provide: ListInvitationsUseCase,
                    useValue: createMock<ListInvitationsUseCase>(),
                },
                {
                    provide: GetInvitationByIdUseCase,
                    useValue: createMock<GetInvitationByIdUseCase>(),
                },
                {
                    provide: UpdateInvitationUseCase,
                    useValue: createMock<UpdateInvitationUseCase>(),
                },
                {
                    provide: DeleteInvitationUseCase,
                    useValue: createMock<DeleteInvitationUseCase>(),
                },
            ],
        }).compile();

        controller = module.get<InvitationController>(InvitationController);
        createInvitationUseCase = module.get(CreateInvitationUseCase);
        listInvitationsUseCase = module.get(ListInvitationsUseCase);
        getInvitationByIdUseCase = module.get(GetInvitationByIdUseCase);
        updateInvitationUseCase = module.get(UpdateInvitationUseCase);
        deleteInvitationUseCase = module.get(DeleteInvitationUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('#createInvitation', () => {
        const createDto = InvitationFixture.getCreateDto();

        it('should create a new invitation', async () => {
            createInvitationUseCase.execute.mockResolvedValue(invitation);

            const result = await controller.createInvitation(
                createDto,
                mockRequest,
            );

            expect(createInvitationUseCase.execute).toHaveBeenCalledWith(
                user,
                createDto,
            );

            expect(result).toEqual({
                message: 'Invitation created successfully',
                data: InvitationMapper.toDto(invitation),
            });
        });

        it('should throw an error if the invitation creation fails', async () => {
            createInvitationUseCase.execute.mockRejectedValue(
                new Error('Invitation creation failed'),
            );

            await expect(
                controller.createInvitation(createDto, mockRequest),
            ).rejects.toThrow('Invitation creation failed');
        });
    });

    describe('#listInvitations', () => {
        it('should return paginated list of invitations', async () => {
            const invitations = [
                InvitationFixture.getEntity({
                    id: '000000000000000000000001',
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

            listInvitationsUseCase.execute.mockResolvedValue(paginationResult);

            const result = await controller.listInvitations(
                mockRequest,
                {},
            );

            expect(listInvitationsUseCase.execute).toHaveBeenCalledWith(
                user,
                undefined,
                undefined,
                undefined,
            );

            expect(result).toEqual({
                message: 'Invitations retrieved successfully',
                data: invitations.map((invitation) =>
                    InvitationMapper.toDto(invitation),
                ),
                pagination: {
                    nextCursor: '000000000000000000000002',
                    previousCursor: '000000000000000000000001',
                    hasNextPage: true,
                    hasPreviousPage: false,
                    count: 2,
                },
            });
        });
    });

    describe('#getInvitationById', () => {
        it('should return invitation by id', async () => {
            getInvitationByIdUseCase.execute.mockResolvedValue(invitation);

            const result = await controller.getInvitationById(
                mockRequest,
                invitationId,
            );

            expect(getInvitationByIdUseCase.execute).toHaveBeenCalledWith(
                user,
                invitationId,
            );

            expect(result).toEqual({
                message: 'Invitation retrieved successfully',
                data: InvitationMapper.toDto(invitation),
            });
        });

        it('should throw an error if the invitation is not found', async () => {
            getInvitationByIdUseCase.execute.mockRejectedValue(
                new Error('Invitation not found'),
            );

            await expect(
                controller.getInvitationById(
                    mockRequest,
                    'non-existent-id',
                ),
            ).rejects.toThrow('Invitation not found');
        });
    });

    describe('#updateInvitation', () => {
        const updateDto = InvitationFixture.getUpdateDto();

        it('should update invitation successfully', async () => {

            updateInvitationUseCase.execute.mockResolvedValue(invitation);

            const result = await controller.updateInvitation(
                mockRequest,
                invitationId,
                updateDto,
            );

            expect(updateInvitationUseCase.execute).toHaveBeenCalledWith(
                user,
                invitationId,
                updateDto,
            );

            expect(result).toEqual({
                message: 'Invitation updated successfully',
                data: InvitationMapper.toDto(invitation),
            });
        });

        it('should throw an error if the invitation is not found', async () => {
            updateInvitationUseCase.execute.mockRejectedValue(
                new Error('Invitation not found'),
            );

            await expect(
                controller.updateInvitation(
                    mockRequest,
                    'non-existent-id',
                    updateDto,
                ),
            ).rejects.toThrow('Invitation not found');
        });
    });

    describe('#deleteInvitation', () => {
        it('should delete invitation successfully', async () => {
            deleteInvitationUseCase.execute.mockResolvedValue(undefined);

            const result = await controller.deleteInvitation(
                invitationId,
                mockRequest,
            );

            expect(deleteInvitationUseCase.execute).toHaveBeenCalledWith(
                user,
                invitationId,
            );

            expect(result).toEqual({
                message: 'Invitation deleted successfully',
            });
        });

        it('should throw an error if the invitation is not found', async () => {
            deleteInvitationUseCase.execute.mockRejectedValue(
                new Error('Invitation not found'),
            );

            await expect(
                controller.deleteInvitation('non-existent-id', mockRequest),
            ).rejects.toThrow('Invitation not found');
        });
    });
});
