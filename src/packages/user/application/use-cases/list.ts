import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
