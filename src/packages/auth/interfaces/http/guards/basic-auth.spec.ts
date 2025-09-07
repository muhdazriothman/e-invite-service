import { BasicAuthGuard } from '@auth/interfaces/http/guards/basic-auth';
import {
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';

interface MockRequestHeaders {
    authorization?: string | null;
}

describe('BasicAuthGuard', () => {
    let guard: BasicAuthGuard;
    let configService: jest.Mocked<ConfigService>;
    let mockExecutionContext: jest.Mocked<ExecutionContext>;

    beforeEach(async() => {
        const mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BasicAuthGuard,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        guard = module.get<BasicAuthGuard>(BasicAuthGuard);
        configService = module.get(ConfigService);

        // Mock ExecutionContext
        mockExecutionContext = {
            switchToHttp: jest.fn(),
        } as any;
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        const validUsername = 'admin';
        const validPassword = 'secret123';

        beforeEach(() => {
            configService.get.mockImplementation((key: string) => {
                if (key === 'ADMIN_CREATE_USERNAME') return validUsername;
                if (key === 'ADMIN_CREATE_PASSWORD') return validPassword;
                return undefined;
            });
        });

        const setupMockRequest = (headers: MockRequestHeaders) => {
            mockExecutionContext.switchToHttp.mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ headers }),
                getResponse: jest.fn().mockReturnValue({}),
                getNext: jest.fn().mockReturnValue({}),
            });
        };

        it('should return true for valid credentials', () => {
            const credentials = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            const result = guard.canActivate(mockExecutionContext);

            expect(result).toBe(true);
        });

        it('should throw UnauthorizedException when authorization header is missing', () => {
            setupMockRequest({});

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Basic authentication required'),
            );
        });

        it('should throw UnauthorizedException when authorization header is null', () => {
            setupMockRequest({
                authorization: null,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Basic authentication required'),
            );
        });

        it('should throw UnauthorizedException when authorization header does not start with Basic', () => {
            setupMockRequest({
                authorization: 'Bearer token123',
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Basic authentication required'),
            );
        });

        it('should throw UnauthorizedException when credentials are not configured', () => {
            configService.get.mockReturnValue(undefined);
            const credentials = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Admin creation credentials not configured'),
            );
        });

        it('should throw UnauthorizedException when username is incorrect', () => {
            const credentials = Buffer.from(`wronguser:${validPassword}`).toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should throw UnauthorizedException when password is incorrect', () => {
            const credentials = Buffer.from(`${validUsername}:wrongpassword`).toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should throw UnauthorizedException when both username and password are incorrect', () => {
            const credentials = Buffer.from('wronguser:wrongpassword').toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should handle malformed base64 credentials', () => {
            setupMockRequest({
                authorization: 'Basic invalid-base64!',
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should handle credentials without colon separator', () => {
            const credentials = Buffer.from('usernamewithoutcolon').toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should handle empty credentials', () => {
            const credentials = Buffer.from('').toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should handle credentials with multiple colons', () => {
            const credentials = Buffer.from('user:pass:extra').toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                new UnauthorizedException('Invalid admin creation credentials'),
            );
        });

        it('should call configService.get with correct parameters', () => {
            const credentials = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');
            setupMockRequest({
                authorization: `Basic ${credentials}`,
            });

            guard.canActivate(mockExecutionContext);

            expect(configService.get).toHaveBeenCalledWith('ADMIN_CREATE_USERNAME');
            expect(configService.get).toHaveBeenCalledWith('ADMIN_CREATE_PASSWORD');
            expect(configService.get).toHaveBeenCalledTimes(2);
        });
    });
});
