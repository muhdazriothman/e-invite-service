import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@user/interfaces/http/controllers/auth';
import { LoginUseCase } from '@user/application/use-cases/login';
import { LoginDto } from '@user/interfaces/http/dtos/login';

describe('@user/interfaces/http/controllers/auth', () => {
    let authController: AuthController;
    let loginUseCase: LoginUseCase;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: LoginUseCase,
                    useValue: {
                        execute: jest.fn()
                    }
                }
            ]
        }).compile();

        authController = module.get<AuthController>(AuthController);
        loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    });

    describe('#login', () => {
        it('should call LoginUseCase.execute and return formatted response', async () => {
            const loginDto: LoginDto = {
                username: 'testuser',
                password: 'password123'
            };

            const tokenResult = { accessToken: 'jwt-token' };
            const expectedResponse = {
                statusCode: 200,
                data: tokenResult
            };

            (loginUseCase.execute as jest.Mock).mockResolvedValue(tokenResult);

            const result = await authController.login(loginDto);

            expect(result).toEqual(expectedResponse);
            expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
        });

        it('should propagate errors from the login use case', async () => {
            const loginDto: LoginDto = {
                username: 'testuser',
                password: 'wrongpassword'
            };

            const error = new Error('Authentication failed');
            (loginUseCase.execute as jest.Mock).mockRejectedValue(error);

            await expect(authController.login(loginDto)).rejects.toThrow(error);
            expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
        });
    });
});