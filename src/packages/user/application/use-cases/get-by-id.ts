import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '@user/application/services/user';
import { User } from '@user/domain/entities/user';

@Injectable()
export class GetUserByIdUseCase {
    constructor (
        private readonly userService: UserService,
    ) {}

    async execute (
        id: string,
    ): Promise<User> {
        try {
            const user = await this.userService.findByIdOrFail(id);

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}
