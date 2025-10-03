import { LoginUseCase } from '@auth/application/use-cases/login';
import { AuthController } from '@auth/interfaces/http/controller';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { AuthFixture } from '@test/fixture/auth';
import { createMock } from '@test/utils/mocks';

describe('@auth/interfaces/http/controller', () => {
    let controller: AuthController;
    let loginUseCase: jest.Mocked<LoginUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: LoginUseCase,
                    useValue: createMock<LoginUseCase>(),
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        loginUseCase = module.get(LoginUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('#login', () => {
        const loginDto = AuthFixture.getLoginDto();

        it('should login a user and return token', async () => {
            const mockToken = { token: 'jwt-token' };

            loginUseCase.execute.mockResolvedValue(mockToken);

            const result = await controller.login(loginDto);

            expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual({
                statusCode: 200,
                data: mockToken,
            });
        });

        it('should throw an error if the login fails', async () => {
            loginUseCase.execute.mockRejectedValue(
                new Error('Invalid credentials'),
            );

            await expect(
                controller.login(loginDto),
            ).rejects.toThrow('Invalid credentials');
        });
    });
});
