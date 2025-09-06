import { LoginUseCase } from '@auth/application/use-cases/login';
import { AuthController } from '@auth/interfaces/http/controller';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';

describe('@auth/interfaces/http/controller', () => {
    let controller: AuthController;
    let loginUseCase: jest.Mocked<LoginUseCase>;

    beforeEach(async () => {
        const mockLoginUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: LoginUseCase,
                    useValue: mockLoginUseCase,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        loginUseCase = module.get(LoginUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should login a user and return token', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockToken = { token: 'jwt-token' };

            loginUseCase.execute.mockResolvedValue(mockToken);

            const result = await controller.login(loginDto);

            expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual({
                statusCode: 200,
                data: mockToken,
            });
        });
    });
});
