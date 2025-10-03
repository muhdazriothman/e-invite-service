import {
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { authErrors } from '@shared/constants/error-codes';
import { createMock } from '@test/utils/mocks';

import { BasicAuthGuard } from './basic-auth';

describe('@auth/interfaces/http/guards/basic-auth', () => {
    let guard: BasicAuthGuard;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BasicAuthGuard,
                {
                    provide: ConfigService,
                    useValue: createMock<ConfigService>(),
                },
            ],
        }).compile();

        guard = module.get<BasicAuthGuard>(BasicAuthGuard);
        mockConfigService = module.get(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('#canActivate', () => {
        const validUsername = 'admin';
        const validPassword = 'secret123';

        let mockContext: ExecutionContext;

        const setupMockRequest = (authorization?: string | null) => {
            mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        headers: { authorization },
                    }),
                }),
            } as unknown as ExecutionContext;
        };

        beforeEach(() => {
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'ADMIN_CREATE_USERNAME') return validUsername;
                if (key === 'ADMIN_CREATE_PASSWORD') return validPassword;
                return undefined;
            });
        });

        it('should return true when credentials are valid', () => {
            const credentials = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            const result = guard.canActivate(mockContext);

            expect(mockConfigService.get).toHaveBeenCalledWith('ADMIN_CREATE_USERNAME');
            expect(mockConfigService.get).toHaveBeenCalledWith('ADMIN_CREATE_PASSWORD');
            expect(result).toBe(true);
        });

        it('should throw UnauthorizedException when authorization header is missing', () => {
            setupMockRequest(undefined);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.BASIC_AUTH_REQUIRED),
            );

            expect(mockConfigService.get).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when authorization header does not start with Basic', () => {
            setupMockRequest('Bearer token123');

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.BASIC_AUTH_REQUIRED),
            );

            expect(mockConfigService.get).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when credentials are not configured', () => {
            mockConfigService.get.mockReturnValue(undefined);
            const credentials = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.ADMIN_CREATION_CREDENTIALS_NOT_CONFIGURED),
            );
        });

        it('should throw UnauthorizedException when username is incorrect', () => {
            const credentials = Buffer.from(`wronguser:${validPassword}`).toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS),
            );
        });

        it('should throw UnauthorizedException when password is incorrect', () => {
            const credentials = Buffer.from(`${validUsername}:wrongpassword`).toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS),
            );
        });

        it('should throw UnauthorizedException when credentials are malformed base64', () => {
            setupMockRequest('Basic invalid-base64!');

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS),
            );
        });

        it('should throw UnauthorizedException when credentials have no colon separator', () => {
            const credentials = Buffer.from('usernamewithoutcolon').toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS),
            );
        });

        it('should throw UnauthorizedException when credentials are empty', () => {
            const credentials = Buffer.from('').toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS),
            );
        });

        it('should throw UnauthorizedException when credentials have multiple colons', () => {
            const credentials = Buffer.from('user:pass:extra').toString('base64');
            setupMockRequest(`Basic ${credentials}`);

            expect(() => guard.canActivate(mockContext)).toThrow(
                new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS),
            );
        });
    });
});
