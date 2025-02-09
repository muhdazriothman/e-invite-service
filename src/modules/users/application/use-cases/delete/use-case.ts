import { DeleteUserDTO } from './dto';
import { UserRepository } from '../../../infra/repository/user/repository';

import { BusinessLogicError, NotFoundError } from '../../../../common/application/exceptions';

interface Dependencies {
    userRepository: UserRepository;
}

export class DeleteUserUseCase {
    userRepository: UserRepository;

    constructor(dependencies: Dependencies) {
        const {
            userRepository,
        } = dependencies;

        if (!(userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;
    }

    static create(dependencies: Dependencies): DeleteUserUseCase {
        const {
            userRepository,
        } = dependencies;

        return new DeleteUserUseCase({
            userRepository,
        });
    }

    async execute(dto: DeleteUserDTO): Promise<void> {
        if (!(dto instanceof DeleteUserDTO)) {
            throw new Error('dto is not an instance of DeleteUserDTO');
        };

        const {
            id,
        } = dto;

        const user = await this.userRepository.findById(id, {
            returnDeleted: false,
        });

        if (user === null) {
            throw new NotFoundError('User not found');
        }

        if (user.deleted) {
            throw new BusinessLogicError('User already deleted');
        }

        await this.userRepository.delete(id);
    }
}
