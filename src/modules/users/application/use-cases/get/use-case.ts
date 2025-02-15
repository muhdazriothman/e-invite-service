import { validate } from 'class-validator';

import { GetUserDto } from './dto';

import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../infra/repository/user/repository';

import {
    ValidationError,
    BusinessLogicError
} from '../../../../common/application/exceptions';

import { ValidationErrorResolver } from '../../../../common/infra/validation-error-resolver';

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
            userRepository
        } = dependencies;

        return new GetUserUseCase({
            userRepository
        });
    }

    async execute(dto: GetUserDto): Promise<User> {
        await GetUserUseCase.validateDto(dto);

        const {
            id
        } = dto;

        const user = await this.userRepository.findById(id, {
            returnDeleted: false
        });

        if (user === null) {
            throw new BusinessLogicError({
                message: 'User not found'
            });
        }

        return user;
    }

    static async validateDto(dto: GetUserDto): Promise<void> {
        if (!(dto instanceof GetUserDto)) {
            throw new Error('dto is not an instance of GetUserDto');
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
