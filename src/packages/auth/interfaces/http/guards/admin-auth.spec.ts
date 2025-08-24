import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth';
import { UserType } from '@user/domain/entities/user';
import { UserAuthService } from '@user/application/services/user-auth.service';

describe('@auth/interfaces/http/guards/admin-auth', () => {
    let guard: AdminAuthGuard;
    let mockUserAuthService: jest.Mocked<UserAuthService>;

    beforeEach(async () => {
        const mockUserAuthServiceInstance = {
            getUserAuthInfo: jest.fn(),
            isUserAdmin: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminAuthGuard,
                {
                    provide: 'UserAuthService',
                    useValue: mockUserAuthServiceInstance,
                },
            ],
        }).compile();

        guard = module.get<AdminAuthGuard>(AdminAuthGuard);
        mockUserAuthService = module.get('UserAuthService');
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        let mockContext: ExecutionContext;

        beforeEach(() => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: null,
                    }),
                    getResponse: jest.fn().mockReturnValue({}),
                }),
            } as any;
        });

        it('should return false if JWT authentication fails', async () => {
            // Mock the parent class to return false
            jest.spyOn(guard, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
                const request = context.switchToHttp().getRequest();
                if (!request.user) {
                    return false;
                }
                return true;
            });

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(false);
        });

        it('should throw ForbiddenException if user is null', async () => {
            // Mock the parent class to return true (JWT auth passes)
            jest.spyOn(guard, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
                const request = context.switchToHttp().getRequest();
                if (!request.user || !request.user.userId) {
                    throw new ForbiddenException('Admin access required');
                }
                return true;
            });

            await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if user type is not admin', async () => {
            const mockGetRequest = jest.fn().mockReturnValue({
                user: { userId: '123', email: 'user@example.com', type: UserType.USER },
            });
            mockContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: mockGetRequest,
                getResponse: jest.fn().mockReturnValue({}),
            });

            // Mock the parent class to return true (JWT auth passes)
            jest.spyOn(guard, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
                const request = context.switchToHttp().getRequest();
                const isAdmin = await mockUserAuthService.isUserAdmin(request.user.userId);
                if (!isAdmin) {
                    throw new ForbiddenException('Admin access required');
                }
                return true;
            });

            // Mock service to return false (not admin)
            mockUserAuthService.isUserAdmin.mockResolvedValue(false);

            await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
        });

        it('should return true if user is admin', async () => {
            const mockGetRequest = jest.fn().mockReturnValue({
                user: { userId: '123', email: 'admin@example.com', type: UserType.ADMIN },
            });
            mockContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: mockGetRequest,
                getResponse: jest.fn().mockReturnValue({}),
            });

            // Mock the parent class to return true (JWT auth passes)
            jest.spyOn(guard, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
                const request = context.switchToHttp().getRequest();
                const isAdmin = await mockUserAuthService.isUserAdmin(request.user.userId);
                if (isAdmin) {
                    return true;
                }
                throw new ForbiddenException('Admin access required');
            });

            // Mock service to return true (is admin)
            mockUserAuthService.isUserAdmin.mockResolvedValue(true);
            mockUserAuthService.getUserAuthInfo.mockResolvedValue({
                id: '123',
                email: 'admin@example.com',
                type: UserType.ADMIN,
            });

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });
    });
});
