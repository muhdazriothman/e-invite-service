import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { userErrors } from '@shared/constants/error-codes';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

@Injectable()
export class UserService {
    constructor (
        private readonly userRepository: UserRepository,
    ) { }

    async validateSameEmailExists (
        email: string,
    ): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (user) {
            throw new ConflictException(userErrors.EMAIL_ALREADY_EXISTS);
        }
    }

    async findByIdOrFail (
        id: string,
    ): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(userErrors.NOT_FOUND);
        }

        return user;
    }
}
