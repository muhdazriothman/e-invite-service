import { Test } from '@nestjs/testing';
import { AuthModule } from './auth';
import { AuthController } from '@user/interfaces/http/controllers/auth';
import { UserRepositoryImpl } from '@user/infra/repositories/user';
import { LoginUseCase } from '@user/application/use-cases/login';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtServiceImpl } from '@user/infra/services/jwt';
import { HashServiceImpl } from '@user/infra/services/hash';
import { ConfigModule } from '@nestjs/config';

describe('@modules/auth', () => {
    let moduleRef: any;

    beforeEach(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [() => ({
                        JWT_SECRET: 'test-jwt-secret'
                    })]
                }),
                AuthModule
            ],
        }).compile();
    });

    it('should be defined', () => {
        expect(moduleRef).toBeDefined();
    });

    describe('imports', () => {
        it('should provide JWT functionality', () => {
            const jwtService = moduleRef.get(NestJwtService);
            expect(jwtService).toBeDefined();
        });
    });

    it('should have AuthController', () => {
        const controller = moduleRef.get(AuthController);
        expect(controller).toBeDefined();
    });

    it('should have LoginUseCase', () => {
        const useCase = moduleRef.get(LoginUseCase);
        expect(useCase).toBeDefined();
    });

    it('should have UserRepositoryImpl as UserRepository', () => {
        const service = moduleRef.get('UserRepository');
        expect(service).toBeInstanceOf(UserRepositoryImpl);
    });

    it('should have JwtServiceImpl as JwtService', () => {
        const service = moduleRef.get('JwtService');
        expect(service).toBeInstanceOf(JwtServiceImpl);
    });

    it('should have HashServiceImpl as HashService', () => {
        const service = moduleRef.get('HashService');
        expect(service).toBeInstanceOf(HashServiceImpl);
    });
});