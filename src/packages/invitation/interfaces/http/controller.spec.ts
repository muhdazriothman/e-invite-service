import { Test, TestingModule } from '@nestjs/testing';
import { InvitationController } from './controller';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { InvitationMapper } from './mapper';
import { InvitationFixture } from '@test/fixture/invitation';
import { RequestWithUser } from './middleware/user-context.middleware';
import { UserFixture } from '@test/fixture/user';

describe('@invitation/interfaces/http/controller', () => {
    let controller: InvitationController;
    let createInvitationUseCase: jest.Mocked<CreateInvitationUseCase>;
    let listInvitationsUseCase: jest.Mocked<ListInvitationsUseCase>;
    let getInvitationByIdUseCase: jest.Mocked<GetInvitationByIdUseCase>;
    let updateInvitationUseCase: jest.Mocked<UpdateInvitationUseCase>;
    let deleteInvitationUseCase: jest.Mocked<DeleteInvitationUseCase>;

    const createInvitationDto = InvitationFixture.getCreateInvitationDto();
    const mockUser = UserFixture.getUserEntity({
        id: '000000000000000000000001',
    });
    const mockRequest: RequestWithUser = {
        user: { id: '000000000000000000000001' },
        userData: mockUser,
    } as RequestWithUser;

    beforeEach(async () => {
        const mockCreateInvitationUseCase = {
            execute: jest.fn(),
        };

        const mockListInvitationsUseCase = {
            execute: jest.fn(),
        };

        const mockGetInvitationByIdUseCase = {
            execute: jest.fn(),
        };

        const mockUpdateInvitationUseCase = {
            execute: jest.fn(),
        };

        const mockDeleteInvitationUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [InvitationController],
            providers: [
                {
                    provide: CreateInvitationUseCase,
                    useValue: mockCreateInvitationUseCase,
                },
                {
                    provide: ListInvitationsUseCase,
                    useValue: mockListInvitationsUseCase,
                },
                {
                    provide: GetInvitationByIdUseCase,
                    useValue: mockGetInvitationByIdUseCase,
                },
                {
                    provide: UpdateInvitationUseCase,
                    useValue: mockUpdateInvitationUseCase,
                },
                {
                    provide: DeleteInvitationUseCase,
                    useValue: mockDeleteInvitationUseCase,
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

    describe('createInvitation', () => {
        it('should create a new invitation', async () => {
            const mockInvitation = InvitationFixture.getInvitationEntity();

            createInvitationUseCase.execute.mockResolvedValue(mockInvitation);

            const result = await controller.createInvitation(createInvitationDto, mockRequest);

            expect(createInvitationUseCase.execute).toHaveBeenCalledWith(createInvitationDto, mockUser);
            expect(result).toEqual({
                message: 'Invitation created successfully',
                data: InvitationMapper.toDto(mockInvitation),
            });
        });

        it('should throw an error if the invitation creation fails', async () => {
            createInvitationUseCase.execute.mockRejectedValue(new Error('Invitation creation failed'));

            await expect(controller.createInvitation(createInvitationDto, mockRequest)).rejects.toThrow('Invitation creation failed');
        });
    });

    describe('listInvitations', () => {
        it('should return list of invitations', async () => {
            const mockInvitations = [
                InvitationFixture.getInvitationEntity({
                    id: 'invitation-1',
                    title: 'Wedding Celebration 1',
                }),
                InvitationFixture.getInvitationEntity({
                    id: 'invitation-2',
                    title: 'Wedding Celebration 2',
                }),
            ];

            listInvitationsUseCase.execute.mockResolvedValue(mockInvitations);

            const result = await controller.listInvitations(mockRequest);

            expect(listInvitationsUseCase.execute).toHaveBeenCalledWith('000000000000000000000001');
            expect(result).toEqual({
                message: 'Invitations retrieved successfully',
                data: mockInvitations.map(invitation => InvitationMapper.toDto(invitation)),
            });
        });
    });

    describe('getInvitationById', () => {
        it('should return invitation by id', async () => {
            const invitationId = 'invitation-id-1';
            const mockInvitation = InvitationFixture.getInvitationEntity({
                id: invitationId,
                title: 'Wedding Celebration',
            });

            getInvitationByIdUseCase.execute.mockResolvedValue(mockInvitation);

            const result = await controller.getInvitationById(invitationId, mockRequest);

            expect(getInvitationByIdUseCase.execute).toHaveBeenCalledWith(invitationId, '000000000000000000000001');
            expect(result).toEqual({
                message: 'Invitation retrieved successfully',
                data: InvitationMapper.toDto(mockInvitation),
            });
        });

        it('should throw an error if the invitation is not found', async () => {
            getInvitationByIdUseCase.execute.mockRejectedValue(new Error('Invitation not found'));

            await expect(controller.getInvitationById('non-existent-id', mockRequest)).rejects.toThrow('Invitation not found');
        });
    });

    describe('updateInvitation', () => {
        it('should update invitation successfully', async () => {
            const invitationId = 'invitation-id-1';
            const updateInvitationDto = InvitationFixture.getCreateInvitationDto({
                title: 'Updated Wedding Celebration',
            });

            const mockInvitation = InvitationFixture.getInvitationEntity({
                id: invitationId,
                title: updateInvitationDto.title,
            });

            updateInvitationUseCase.execute.mockResolvedValue(mockInvitation);

            const result = await controller.updateInvitation(invitationId, updateInvitationDto, mockRequest);

            expect(updateInvitationUseCase.execute).toHaveBeenCalledWith(invitationId, updateInvitationDto, '000000000000000000000001');
            expect(result).toEqual({
                message: 'Invitation updated successfully',
                data: InvitationMapper.toDto(mockInvitation),
            });
        });

        it('should throw an error if the invitation is not found', async () => {
            updateInvitationUseCase.execute.mockRejectedValue(new Error('Invitation not found'));

            await expect(controller.updateInvitation('non-existent-id', createInvitationDto, mockRequest)).rejects.toThrow('Invitation not found');
        });
    });

    describe('deleteInvitation', () => {
        it('should delete invitation successfully', async () => {
            const invitationId = 'invitation-id-1';

            deleteInvitationUseCase.execute.mockResolvedValue(undefined);

            const result = await controller.deleteInvitation(invitationId, mockRequest);

            expect(deleteInvitationUseCase.execute).toHaveBeenCalledWith(invitationId, '000000000000000000000001');
            expect(result).toEqual({
                message: 'Invitation deleted successfully',
            });
        });

        it('should throw an error if the invitation is not found', async () => {
            deleteInvitationUseCase.execute.mockRejectedValue(new Error('Invitation not found'));

            await expect(controller.deleteInvitation('non-existent-id', mockRequest)).rejects.toThrow('Invitation not found');
        });
    });
});
