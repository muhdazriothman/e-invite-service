import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from '@user/interfaces/http/controllers/auth';
import { JwtStrategy } from '@user/interfaces/http/strategies/jwt';
import { JwtAuthGuard } from '@user/interfaces/http/guards/jwt-auth';
import { LoginUseCase } from '@user/application/use-cases/login';
import { RegisterUserUseCase } from '@user/application/use-cases/register';
import { UserRepositoryImpl } from '@user/infra/repositories/user';
import { JwtServiceImpl } from '@user/infra/services/jwt';
import { HashServiceImpl } from '@user/infra/services/hash';

import { AuthModule } from './auth';

describe('AuthModule', () => {
    let moduleRef: any;

    beforeEach(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [
                        () => ({
                            JWT_SECRET: process.env.JWT_SECRET,
                        }),
                    ],
                }),
                AuthModule,
            ],
        }).compile();
    });

    describe('Module Definition', () => {
        it('should be defined', () => {
            expect(moduleRef).toBeDefined();
        });

        it('should have JWT module configured', () => {
            const jwtModule = moduleRef.get(JwtModule);
            expect(jwtModule).toBeDefined();
        });
    });

    describe('Controllers', () => {
        it('should provide AuthController', () => {
            const controller = moduleRef.get(AuthController);
            expect(controller).toBeDefined();
        });
    });

    describe('Use Cases', () => {
        it('should provide LoginUseCase', () => {
            const useCase = moduleRef.get(LoginUseCase);
            expect(useCase).toBeDefined();
        });

        it('should provide RegisterUseCase', () => {
            const useCase = moduleRef.get(RegisterUserUseCase);
            expect(useCase).toBeDefined();
        });
    });

    describe('Authentication Services', () => {
        it('should provide JwtStrategy', () => {
            const strategy = moduleRef.get(JwtStrategy);
            expect(strategy).toBeDefined();
        });

        it('should provide JwtAuthGuard', () => {
            const guard = moduleRef.get(JwtAuthGuard);
            expect(guard).toBeDefined();
        });
    });

    describe('Repository Providers', () => {
        it('should provide UserRepositoryImpl as UserRepository', () => {
            const repository = moduleRef.get('UserRepository');
            expect(repository).toBeInstanceOf(UserRepositoryImpl);
        });
    });

    describe('Service Providers', () => {
        it('should provide JwtServiceImpl as JwtService', () => {
            const service = moduleRef.get('JwtService');
            expect(service).toBeInstanceOf(JwtServiceImpl);
        });

        it('should provide HashServiceImpl as HashService', () => {
            const service = moduleRef.get('HashService');
            expect(service).toBeInstanceOf(HashServiceImpl);
        });
    });

    describe('Module Exports', () => {
        it('should export JwtService', () => {
            const service = moduleRef.get('JwtService');
            expect(service).toBeDefined();
        });

        it('should export HashService', () => {
            const service = moduleRef.get('HashService');
            expect(service).toBeDefined();
        });

        it('should export UserRepository', () => {
            const repository = moduleRef.get('UserRepository');
            expect(repository).toBeDefined();
        });
    });

    describe('Environment Configuration', () => {
        it('should use test configuration when NODE_ENV is test', () => {
            expect(process.env.NODE_ENV).toBe('test');
            const repository = moduleRef.get('UserRepository');
            expect(repository).toBeInstanceOf(UserRepositoryImpl);
        });

        it('should have JWT_SECRET configured', () => {
            expect(process.env.JWT_SECRET).toBeDefined();
            expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
        });
    });
});
