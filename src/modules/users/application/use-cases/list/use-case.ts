import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../infra/repository/user/repository';

interface Dependencies {
    userRepository: UserRepository;
}

export class ListUserUseCase {
    userRepository: UserRepository;

    constructor(dependencies: Dependencies) {
        if (!(dependencies.userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;
    }

    static create(dependencies: Dependencies): ListUserUseCase {
        const {
            userRepository
        } = dependencies;

        return new ListUserUseCase({
            userRepository
        });
    }

    async execute(): Promise<User[]> {
        return await this.userRepository.findAll({
            returnDeleted: false
        });
    }
}
