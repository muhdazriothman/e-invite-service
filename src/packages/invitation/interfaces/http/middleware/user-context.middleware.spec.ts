import { BadRequestException } from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UserFixture } from '@test/fixture/user';
import { UserRepository } from '@user/infra/repository';
import {
  Request,
  Response,
} from 'express';

import {
  RequestWithUser,
  UserContextMiddleware,
} from './user-context.middleware';

describe('UserContextMiddleware', () => {
  let middleware: UserContextMiddleware;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockRequest: RequestWithUser = {
    user: { id: '000000000000000000000001' },
  } as RequestWithUser;

  const mockResponse = {} as Response;
  const mockNext = jest.fn();

  beforeEach(async() => {
    const mockUserRepositoryInstance = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserContextMiddleware,
        {
          provide: UserRepository,
          useValue: mockUserRepositoryInstance,
        },
      ],
    }).compile();

    middleware = module.get<UserContextMiddleware>(UserContextMiddleware);
    mockUserRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should attach user data to request when user exists', async() => {
      const user = UserFixture.getEntity({
        id: '000000000000000000000001',
      });

      mockUserRepository.findById.mockResolvedValue(user);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        '000000000000000000000001',
      );
      expect(mockRequest.userData).toEqual(user);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user ID is not found in request', async() => {
      const requestWithoutUser: RequestWithUser = {} as RequestWithUser;

      await expect(
        middleware.use(requestWithoutUser, mockResponse, mockNext),
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is not found in database', async() => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        middleware.use(mockRequest, mockResponse, mockNext),
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        '000000000000000000000001',
      );
    });
  });
});
