import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate } from 'class-validator';

import { config } from '../../../../../config';

import { LoginUserDto } from './dto';

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

export class LoginUserUseCase {
    userRepository: UserRepository;

    constructor(dependencies: Dependencies) {
        if (!(dependencies.userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;
    }

    static create(dependencies: Dependencies): LoginUserUseCase {
        const {
            userRepository
        } = dependencies;

        return new LoginUserUseCase({
            userRepository
        });
    }

    async execute(dto: LoginUserDto): Promise<string> {
        await LoginUserUseCase.validateDto(dto);

        const {
            email,
            password
        } = dto;

        const user = await this.userRepository.findByEmail(email, {
            returnDeleted: false
        });

        if (!user) {
            throw new BusinessLogicError({
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = LoginUserUseCase.isPasswordValid({
            password,
            hashedPassword: user.password
        });

        if (!isPasswordValid) {
            throw new BusinessLogicError({
                message: 'Invalid credentials'
            });
        }

        return LoginUserUseCase.generateToken(user);
    }

    static isPasswordValid(params: { password: string, hashedPassword: string }): boolean {
        const {
            password,
            hashedPassword
        } = params;

        return bcrypt.compareSync(password, hashedPassword);
    }

    static generateToken(user: User): string {
        const jwtSecret = config.JWT_SECRET;

        return jwt.sign({
            id: user.id,
            email: user.email
        }, jwtSecret as string, {
            expiresIn: '1h'
        });
    }

    static async validateDto(dto: LoginUserDto): Promise<void> {
        if (!(dto instanceof LoginUserDto)) {
            throw new Error('dto is not an instance of LoginUserDto');
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
