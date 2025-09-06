import {
    Injectable,
    Inject,
    NotFoundException
} from '@nestjs/common';
import { UserRepository } from '@user/infra/repository';
import { User } from '@user/domain/entities/user';

@Injectable()
export class GetUserByIdUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) { }

    async execute(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return user;
    }
}
