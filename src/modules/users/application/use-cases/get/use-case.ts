import { User } from '../../../domain/entities/user';
import { GetUserDTO } from './dto';
import { UserRepository } from '../../../infra/repository/user/repository';

import { BusinessLogicError } from '../../../../common/application/exceptions';

interface Dependencies {
    userRepository: UserRepository;
}

export class GetUserUseCase {
    userRepository: UserRepository;

    constructor(dependencies: Dependencies) {
        if (!(dependencies.userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;
    }

    static create(dependencies: Dependencies): GetUserUseCase {
        const {
            userRepository,
        } = dependencies;

        return new GetUserUseCase({
            userRepository,
        });
    }

    async execute(dto: GetUserDTO): Promise<User> {
        const {
            id,
        } = dto;

        const user = await this.userRepository.findById(id, {
            returnDeleted: false,
        });

        if (user === null) {
            throw new BusinessLogicError('User not found');
        }

        return user;
    }
}
