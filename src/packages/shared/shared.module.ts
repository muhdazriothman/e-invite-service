import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  MongooseModule,
  getModelToken,
} from '@nestjs/mongoose';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import {
  UserMongoModelName,
  UserMongoSchema,
} from '@user/infra/schema';

// Mock factory for testing
const createMockUserRepository = () =>
  new UserRepository({
    findOne: () => ({ lean: async() => null }),
    create: async(user: User) => ({
      toObject: () => ({ _id: 'test', ...user }),
    }),
    find: () => ({ lean: async() => [] }),
  } as unknown as (typeof UserRepository.prototype)['userModel']);

// Production repository factory
const createUserRepository = (
  userModel: (typeof UserRepository.prototype)['userModel'],
) => new UserRepository(userModel);

@Module({
  imports: [
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
        MongooseModule.forFeature([
          { name: UserMongoModelName, schema: UserMongoSchema },
        ]),
      ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'test-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    {
      provide: 'UserRepository',
      useFactory:
        process.env.NODE_ENV === 'test'
          ? createMockUserRepository
          : createUserRepository,
      inject:
        process.env.NODE_ENV === 'test'
          ? []
          : [getModelToken(UserMongoModelName)],
    },
    {
      provide: 'HashService',
      useClass: HashService,
    },
    {
      provide: 'JwtService',
      useClass: JwtService,
    },
  ],
  exports: ['UserRepository', 'HashService', 'JwtService'],
})
export class SharedModule {}
