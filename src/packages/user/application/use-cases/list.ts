import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '@user/infra/repository';
import { User } from '@user/domain/entities/user';

@Injectable()
export class ListUsersUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) { }

    async execute(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}
