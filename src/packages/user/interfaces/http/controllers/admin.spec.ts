import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import { CreateAdminUseCase } from '@user/application/use-cases/create-admin';
import { AdminController } from '@user/interfaces/http/controllers/admin';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';

describe('@user/interfaces/http/controllers/admin', () => {
    let controller: AdminController;
    let createAdminUseCase: jest.Mocked<CreateAdminUseCase>;

    beforeEach(async() => {
        const mockCreateAdminUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminController],
            providers: [
                {
                    provide: CreateAdminUseCase,
                    useValue: mockCreateAdminUseCase,
                },
            ],
        }).compile();

        controller = module.get<AdminController>(AdminController);
        createAdminUseCase = module.get(CreateAdminUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createAdmin', () => {
        const createAdminDto: CreateAdminDto = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
        };

        it('should create admin user successfully', async() => {
            const mockAdmin = UserFixture.getAdminUser();

            createAdminUseCase.execute.mockResolvedValue(mockAdmin);

            const result = await controller.createAdmin(createAdminDto);

            expect(createAdminUseCase.execute).toHaveBeenCalledWith(createAdminDto);
            expect(result).toEqual({
                message: 'Admin created successfully',
                data: {
                    id: mockAdmin.id,
                    name: mockAdmin.name,
                    email: mockAdmin.email,
                    capabilities: mockAdmin.capabilities,
                    createdAt: mockAdmin.createdAt.toISOString(),
                    updatedAt: mockAdmin.updatedAt.toISOString(),
                },
            });
        });

        it('should handle admin creation failure', async() => {
            createAdminUseCase.execute.mockRejectedValue(
                new Error('User creation failed'),
            );

            await expect(controller.createAdmin(createAdminDto)).rejects.toThrow(
                'User creation failed',
            );
        });
    });
});
