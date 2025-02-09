import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '../../../../../config';

import { User } from '../../../domain/entities/user';
import { LoginUserDTO } from './dto';
import { UserRepository } from '../../../infra/repository/user/repository';

import { BusinessLogicError } from '../../../../common/application/exceptions';

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
            userRepository,
        } = dependencies;

        return new LoginUserUseCase({
            userRepository,
        });
    }

    async execute(dto: LoginUserDTO): Promise<string> {
        const {
            email,
            password,
        } = dto;

        const user = await this.userRepository.findByEmail(email, {
            returnDeleted: false,
        });
        
        if (!user) {
            throw new BusinessLogicError('Invalid credentials');
        }

        const isPasswordValid = LoginUserUseCase.isPasswordValid({
            password,
            hashedPassword: user.password,
        });

        if (!isPasswordValid) {
            throw new BusinessLogicError('Invalid credentials');
        }

        return LoginUserUseCase.generateToken(user);
    }

    static isPasswordValid(params: { password: string, hashedPassword: string }): boolean {
        const { 
            password, 
            hashedPassword,
        } = params;

        return bcrypt.compareSync(password, hashedPassword);
    }

    static generateToken(user: User): string {
        const jwtSecret = config.JWT_SECRET;

        return jwt.sign({
            id: user.id,
            email: user.email,
        }, jwtSecret as string, {
            expiresIn: '1h',
        });
    }
}
