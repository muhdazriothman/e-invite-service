import { validate } from 'class-validator';

import { DeleteUserDto } from './dto';

import { UserRepository } from '../../../infra/repository/user/repository';

import {
    ValidationError,
    BusinessLogicError,
    NotFoundError
} from '../../../../common/application/exceptions';

import { ValidationErrorResolver } from '../../../../common/infra/validation-error-resolver';

interface Dependencies {
    userRepository: UserRepository;
}

export class DeleteUserUseCase {
    userRepository: UserRepository;

    constructor(dependencies: Dependencies) {
        const {
            userRepository
        } = dependencies;

        if (!(userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;
    }

    static create(dependencies: Dependencies): DeleteUserUseCase {
        const {
            userRepository
        } = dependencies;

        return new DeleteUserUseCase({
            userRepository
        });
    }

    async execute(dto: DeleteUserDto): Promise<void> {
        await DeleteUserUseCase.validateDto(dto);

        const {
            id
        } = dto;

        const user = await this.userRepository.findById(id, {
            returnDeleted: false
        });

        if (user === null) {
            throw new NotFoundError({
                message: 'User not found'
            });
        }

        if (user.deleted) {
            throw new BusinessLogicError({
                message: 'User already deleted'
            });
        }

        await this.userRepository.delete(id);
    }

    static async validateDto(dto: DeleteUserDto): Promise<void> {
        if (!(dto instanceof DeleteUserDto)) {
            throw new Error('dto is not an instance of DeleteUserDto');
        }

        const errors = await validate(dto);

        if (errors.length > 0) {
            const errorMessages = ValidationErrorResolver.resolveValidationErrors(errors);

            throw new ValidationError({
                message: 'Invalid parameters',
                errors: errorMessages
            });
        }
    }
}
