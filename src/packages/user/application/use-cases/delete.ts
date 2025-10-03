import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { userErrors } from '@shared/constants/error-codes';
import { UserRepository } from '@user/infra/repository';

import { UserService } from '../services/user';

@Injectable()
export class DeleteUserUseCase {
    constructor (
        private readonly userRepository: UserRepository,

        private readonly userService: UserService,
    ) {}

    async execute (
        id: string,
    ): Promise<void> {
        try {
            await this.userService.findByIdOrFail(id);

            await this.deleteUser(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }

    async deleteUser (
        id: string,
    ): Promise<void> {
        const deleted = await this.userRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException(userErrors.NOT_FOUND);
        }
    }
}
