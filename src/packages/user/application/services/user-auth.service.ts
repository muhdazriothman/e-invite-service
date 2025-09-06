import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { UserRepository } from '@user/infra/repository';

export interface UserAuthInfo {
  id: string;
  email: string;
  type: string;
}

@Injectable()
export class UserAuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async getUserAuthInfo(userId: string): Promise<UserAuthInfo | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      type: user.type,
    };
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return false;
    }

    return user.type === 'admin';
  }
}
