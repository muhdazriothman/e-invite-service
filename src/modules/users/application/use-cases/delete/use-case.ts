import { DeleteUserDTO } from './dto';
import { UserRepository } from '../../../infra/repository/user/repository';

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
            throw new Error('User not found');
        }

        if (user.deleted) {
            throw new Error('User already deleted');
        }

        await this.userRepository.delete(id);
    }
}
