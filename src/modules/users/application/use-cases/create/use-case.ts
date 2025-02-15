import bcrypt from 'bcrypt';

import { validate } from 'class-validator';

import { CreateUserDto } from './dto';

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

export interface Options {
    saltRounds: number;
}

export class CreateUserUseCase {
    userRepository: UserRepository;
    saltRounds: number;

    constructor(dependencies: Dependencies, options: Options) {
        const {
            userRepository
        } = dependencies;

        if (!(userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;

        const {
            saltRounds = 10
        } = options;

        this.saltRounds = saltRounds;
    }

    static create(dependencies: Dependencies, options: Options): CreateUserUseCase {
        const {
            userRepository
        } = dependencies;

        const {
            saltRounds = 10
        } = options;

        return new CreateUserUseCase({
            userRepository
        }, {
            saltRounds
        });
    }

    async execute(dto: CreateUserDto): Promise<User> {
        await CreateUserUseCase.validateDto(dto);

        const {
            email
        } = dto;

        const sameEmailUser = await this.userRepository.findByEmail(email, {
            returnDeleted: false
        });

        if (sameEmailUser !== null) {
            throw new BusinessLogicError({
                message: 'User with the same email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

        const user = User.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword
        });

        return await this.userRepository.create(user);
    }

    static async validateDto(dto: CreateUserDto): Promise<void> {
        if (!(dto instanceof CreateUserDto)) {
            throw new Error('dto is not an instance of CreateUserDto');
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
