import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    DocumentBuilder,
    SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from '@/app.module';

async function bootstrap () {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('E-Invite Service API')
        .setDescription('API for e-invite system including authentication, invitations, payments, and user management')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
