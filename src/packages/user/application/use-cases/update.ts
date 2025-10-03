import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { userErrors } from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { UserService } from '@user/application/services/user';
import {
    UpdateUserProps,
    User,
} from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { UpdateUserDto } from '@user/interfaces/http/dtos/update';

@Injectable()
export class UpdateUserUseCase {
    constructor (
        private readonly userRepository: UserRepository,

        private readonly userService: UserService,
    ) { }

    async execute (
        id: string,
        updateData: UpdateUserDto,
    ): Promise<User> {
        const {
            name,
            password,
        } = updateData;

        try {
            await this.userService.findByIdOrFail(id);

            const updates: Partial<UpdateUserProps> = {};

            if (name !== undefined) {
                updates.name = updateData.name;
            }

            if (password !== undefined) {
                updates.passwordHash = await HashService.hash(password);
            }

            const result = await this.userRepository.updateById(
                id,
                updates,
            );

            if (!result) {
                throw new NotFoundException(userErrors.NOT_FOUND);
            }

            return result;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}
