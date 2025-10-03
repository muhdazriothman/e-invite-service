import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { JwtUser } from '@auth/interfaces/http/strategies/jwt';
import {
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { authErrors } from '@shared/constants/error-codes';
import { createMock } from '@test/utils/mocks';
import { UserAuthService } from '@user/application/services/user-auth.service';
import { UserType } from '@user/domain/entities/user';

import { AdminAuthGuard } from './admin-auth';

describe('@auth/interfaces/http/guards/admin-auth', () => {
    const userId = '000000000000000000000001';

    let guard: AdminAuthGuard;
    let mockUserAuthService: jest.Mocked<UserAuthService>;
    let spySuperCanActivate: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminAuthGuard,
                {
                    provide: 'UserAuthService',
                    useValue: createMock<UserAuthService>(),
                },
            ],
        }).compile();

        guard = module.get<AdminAuthGuard>(AdminAuthGuard);
        mockUserAuthService = module.get('UserAuthService');

        spySuperCanActivate = jest.spyOn(JwtAuthGuard.prototype, 'canActivate');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('#canActivate', () => {
        const jwtUser: JwtUser = {
            id: userId,
            email: 'admin@example.com',
            type: UserType.ADMIN,
        };

        const mockRequest = {
            user: jwtUser,
        };

        let mockContext: ExecutionContext;

        beforeEach(() => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue(mockRequest),
                }),
            } as unknown as ExecutionContext;

            spySuperCanActivate.mockResolvedValue(true);
            mockUserAuthService.isUserAdmin.mockResolvedValue(true);
            mockUserAuthService.getUserAuthInfo.mockResolvedValue({
                id: userId,
                email: 'admin@example.com',
                type: UserType.ADMIN,
            });
        });

        it('should return true when user is admin', async () => {
            const result = await guard.canActivate(mockContext);

            expect(spySuperCanActivate).toHaveBeenCalledWith(mockContext);
            expect(mockUserAuthService.isUserAdmin).toHaveBeenCalledWith(userId);
            expect(mockUserAuthService.getUserAuthInfo).toHaveBeenCalledWith(userId);
            expect(result).toBe(true);
        });

        it('should update request user with auth info when user is admin', async () => {
            await guard.canActivate(mockContext);

            expect(mockRequest.user).toEqual({
                id: userId,
                email: 'admin@example.com',
                type: UserType.ADMIN,
            });
        });

        it('should return false when JWT authentication fails', async () => {
            spySuperCanActivate.mockResolvedValue(false);

            const result = await guard.canActivate(mockContext);

            expect(spySuperCanActivate).toHaveBeenCalledWith(mockContext);
            expect(mockUserAuthService.isUserAdmin).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should throw ForbiddenException when user is null', async () => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({ user: null }),
                }),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED),
            );

            expect(spySuperCanActivate).toHaveBeenCalledWith(mockContext);
            expect(mockUserAuthService.isUserAdmin).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException when user id is missing', async () => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: { email: 'test@example.com' },
                    }),
                }),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED),
            );

            expect(spySuperCanActivate).toHaveBeenCalledWith(mockContext);
            expect(mockUserAuthService.isUserAdmin).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException when user is not admin', async () => {
            mockUserAuthService.isUserAdmin.mockResolvedValue(false);

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED),
            );

            expect(spySuperCanActivate).toHaveBeenCalledWith(mockContext);
            expect(mockUserAuthService.isUserAdmin).toHaveBeenCalledWith(userId);
            expect(mockUserAuthService.getUserAuthInfo).not.toHaveBeenCalled();
        });
    });
});
