import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/auth/users (GET)', () => {
        return request(app.getHttpServer())
            .get('/auth/users')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('statusCode', 200);
                expect(res.body).toHaveProperty('data');
                expect(Array.isArray(res.body.data)).toBe(true);
            });
    });
});
