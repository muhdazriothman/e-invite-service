import bcrypt from 'bcrypt';

import { User } from '../../../domain/entities/user';
import { CreateUserDTO } from './dto';
import { UserRepository } from '../../../infra/repository/user/repository';

import { BusinessLogicError } from '../../../../common/application/exceptions';

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
            userRepository,
        } = dependencies;

        if (!(userRepository instanceof UserRepository)) {
            throw new Error('userRepository is not an instance of UserRepository');
        }

        this.userRepository = dependencies.userRepository;

        const {
            saltRounds = 10,
        } = options;

        this.saltRounds = saltRounds;
    }

    static create(dependencies: Dependencies, options: Options): CreateUserUseCase {
        const {
            userRepository,
        } = dependencies;

        const {
            saltRounds = 10,
        } = options;

        return new CreateUserUseCase({
            userRepository,
        }, {
            saltRounds,
        });
    }

    async execute(dto: CreateUserDTO): Promise<User> {
        if (!(dto instanceof CreateUserDTO)) {
            throw new Error('dto is not an instance of CreateUserDTO');
        };

        const {
            email,
        } = dto;

        const sameEmailUser = await this.userRepository.findByEmail(email, {
            returnDeleted: false,
        });

        if (sameEmailUser !== null) {
            throw new BusinessLogicError('User already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

        const user = User.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        return await this.userRepository.create(user);
    }
}
