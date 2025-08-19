import { User } from '@user/domain/entities/user';

export class UserFixture {
  static getUserProps(props: Partial<User> = {}) {
    const {
      id = '1',
      username = 'testuser',
      email = 'testuser@example.com',
      passwordHash = 'hashed_password',
    } = props;

    return {
      id,
      username,
      email,
      passwordHash,
    };
  }

  static getUserEntity(params: Partial<User> = {}) {
    return new User(UserFixture.getUserProps(params));
  }

  static getAdminUser() {
    return UserFixture.getUserEntity({
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: 'hashed_password',
    });
  }

  static getNewUser() {
    return UserFixture.getUserEntity({
      id: '123',
      username: 'newuser',
      email: 'newuser@example.com',
      passwordHash: 'hashed_password',
    });
  }
}
