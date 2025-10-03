import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
    MongooseModule,
    getModelToken,
} from '@nestjs/mongoose';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';
import { UserRepository } from '@user/infra/repository';
import {
    UserMongoModelName,
    UserMongoSchema,
    UserHydrated,
} from '@user/infra/schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserMongoModelName,
                schema: UserMongoSchema,
            },
        ]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'test-secret',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [
        {
            provide: UserRepository,
            useFactory: (userModel: Model<UserHydrated>) => new UserRepository(userModel),
            inject: [getModelToken(UserMongoModelName)],
        },
        {
            provide: 'BCRYPT',
            useValue: bcrypt,
        },
        HashService,
        JwtService,
    ],
    exports: [UserRepository, HashService, JwtService],
})
export class SharedModule {}
