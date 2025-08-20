import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';

describe('AppModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    describe('imports', () => {
        it('should have AuthModule', () => {
            const metadata = Reflect.getMetadata('imports', AppModule);
            expect(metadata).toContain(AuthModule);
        });

        it('should have UserModule', () => {
            const metadata = Reflect.getMetadata('imports', AppModule);
            expect(metadata).toContain(UserModule);
        });
    });

    describe('controllers', () => {
        it('should have empty Controller', () => {
            const controllers = Reflect.getMetadata('controllers', AppModule);
            expect(controllers).toEqual([]);
        });
    });

    describe('providers', () => {
        it('should have empty Providers', () => {
            const providers = Reflect.getMetadata('providers', AppModule);
            expect(providers).toEqual([]);
        });
    });
});
