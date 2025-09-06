import { PlanType } from '@payment/domain/entities/payment';
import {
  User,
  UserType,
} from '@user/domain/entities/user';

export class UserFixture {
  static getUserProps(props: Partial<User> = {}) {
    const {
      id = '1',
      name = 'testuser',
      email = 'testuser@example.com',
      passwordHash = 'hashed_password',
      type = UserType.USER,
      capabilities = {
        invitationLimit: User.getInvitationLimitFromPlanType(PlanType.BASIC),
      },
      paymentId = 'payment-123',
      isDeleted = false,
      createdAt = new Date(),
      updatedAt = new Date(),
      deletedAt = null,
    } = props;

    return {
      id,
      name,
      email,
      passwordHash,
      type,
      capabilities,
      paymentId,
      isDeleted,
      createdAt,
      updatedAt,
      deletedAt,
    };
  }

  static getEntity(params: Partial<User> = {}) {
    const props = UserFixture.getUserProps(params);
    return new User(props);
  }

  static getAdminUser() {
    return UserFixture.getEntity({
      id: '1',
      name: 'admin',
      email: 'admin@example.com',
      passwordHash: 'hashed_password',
      type: UserType.ADMIN,
    });
  }

  static getNewUser() {
    return UserFixture.getEntity({
      id: '123',
      name: 'newuser',
      email: 'newuser@example.com',
      passwordHash: 'hashed_password',
      type: UserType.USER,
    });
  }
}
