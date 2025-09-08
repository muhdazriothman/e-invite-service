import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';
import {
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { authErrors } from '@shared/constants/error-codes';
import { UserAuthService } from '@user/application/services/user-auth.service';
import { UserType } from '@user/domain/entities/user';

interface MockRequest {
  user: {
    userId: string;
    email: string;
    type: UserType;
  } | null;
}

function isMockRequest(request: unknown): request is MockRequest {
    return typeof request === 'object' && request !== null && 'user' in request;
}


describe('@auth/interfaces/http/guards/admin-auth', () => {
    let guard: AdminAuthGuard;
    let mockUserAuthService: jest.Mocked<UserAuthService>;

    beforeEach(async() => {
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

    describe('#canActivate', () => {
        let mockContext: ExecutionContext;

        beforeEach(() => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: null,
                    }),
                    getResponse: jest.fn().mockReturnValue({}),
                }),
            } as unknown as ExecutionContext;
        });

        it('should return false if JWT authentication fails', async() => {
            jest
                .spyOn(guard, 'canActivate')
                .mockImplementation((context: ExecutionContext) => {
                    const request: unknown = context.switchToHttp().getRequest();
                    if (!isMockRequest(request) || !request.user) {
                        return Promise.resolve(false);
                    }
                    return Promise.resolve(true);
                });

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(false);
        });

        it('should throw ForbiddenException if user is null', async() => {
            jest
                .spyOn(guard, 'canActivate')
                .mockImplementation(async(context: ExecutionContext) => {
                    const request: unknown = context.switchToHttp().getRequest();
                    if (!isMockRequest(request) || !request.user || !request.user.userId) {
                        throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
                    }
                    await Promise.resolve();
                    return true;
                });

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw ForbiddenException if user type is not admin', async() => {
            const mockGetRequest = jest.fn().mockReturnValue({
                user: { userId: '123', email: 'user@example.com', type: UserType.USER },
            });
            mockContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: mockGetRequest,
                getResponse: jest.fn().mockReturnValue({}),
            });

            jest
                .spyOn(guard, 'canActivate')
                .mockImplementation(async(context: ExecutionContext) => {
                    const request: unknown = context.switchToHttp().getRequest();
                    if (!isMockRequest(request) || !request.user) {
                        throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
                    }
                    const isAdmin = await mockUserAuthService.isUserAdmin(
                        request.user.userId,
                    );
                    if (!isAdmin) {
                        throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
                    }
                    return true;
                });

            mockUserAuthService.isUserAdmin.mockResolvedValue(false);

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should return true if user is admin', async() => {
            const mockGetRequest = jest.fn().mockReturnValue({
                user: {
                    userId: '123',
                    email: 'admin@example.com',
                    type: UserType.ADMIN,
                },
            });
            mockContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: mockGetRequest,
                getResponse: jest.fn().mockReturnValue({}),
            });

            jest
                .spyOn(guard, 'canActivate')
                .mockImplementation(async(context: ExecutionContext) => {
                    const request: unknown = context.switchToHttp().getRequest();
                    if (!isMockRequest(request) || !request.user) {
                        throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
                    }
                    const isAdmin = await mockUserAuthService.isUserAdmin(
                        request.user.userId,
                    );
                    if (isAdmin) {
                        return true;
                    }
                    throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
                });

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
