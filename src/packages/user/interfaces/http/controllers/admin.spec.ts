import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { UserType } from '@user/domain/entities/user';
import { AdminController } from '@user/interfaces/http/controllers/admin';
import { UserMapper } from '@user/interfaces/http/mapper';

describe('@user/interfaces/http/controllers/admin', () => {
    let controller: AdminController;
    let createAdminUseCase: jest.Mocked<CreateAdminUseCase>;

    const admin = UserFixture.getEntity({
        id: '000000000000000000000001',
        type: UserType.ADMIN,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminController],
            providers: [
                {
                    provide: CreateAdminUseCase,
                    useValue: createMock<CreateAdminUseCase>(),
                },
            ],
        }).compile();

        controller = module.get<AdminController>(AdminController);
        createAdminUseCase = module.get(CreateAdminUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('#createAdmin', () => {
        const createDto = UserFixture.getCreateDto();

        it('should create admin user successfully', async () => {
            createAdminUseCase.execute.mockResolvedValue(admin);

            const result = await controller.createAdmin(createDto);

            expect(createAdminUseCase.execute).toHaveBeenCalledWith(createDto);
            expect(result).toEqual({
                message: 'Admin created successfully',
                data: UserMapper.toDto(admin),
            });
        });

        it('should throw an error if the admin creation fails', async () => {
            createAdminUseCase.execute.mockRejectedValue(
                new Error('User creation failed'),
            );

            await expect(controller.createAdmin(createDto)).rejects.toThrow(
                'User creation failed',
            );
        });
    });
});
