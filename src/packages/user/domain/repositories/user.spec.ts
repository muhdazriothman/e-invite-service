import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/domain/repositories/user';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';

describe('@user/domain/repositories/user', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let userProps: any;
  let user: User;

  beforeEach(() => {
    userProps = UserFixture.getUserProps({
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword123',
    });
    user = UserFixture.getUserEntity(userProps);

    userRepository = createMock<UserRepository>();
  });

  describe('#findByUsername', () => {
    it('should return a user when found by username', async () => {
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(user);

      const result = await userRepository.findByUsername('testuser');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(userProps.id);
      expect(result?.username).toBe(userProps.username);
      expect(result?.email).toBe(userProps.email);
      expect(result?.passwordHash).toBe(userProps.passwordHash);
      expect(userRepository.findByUsername).toHaveBeenNthCalledWith(
        1,
        'testuser',
      );
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(null);

      const result = await userRepository.findByUsername('nonexistentuser');

      expect(result).toBeNull();
      expect(userRepository.findByUsername).toHaveBeenNthCalledWith(
        1,
        'nonexistentuser',
      );
    });
  });
});
