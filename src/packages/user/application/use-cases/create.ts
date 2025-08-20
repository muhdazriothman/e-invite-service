import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '@user/infra/repository';
import { User } from '@user/domain/entities/user';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { HashService } from '@common/services/hash';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('HashService')
        private readonly hashService: HashService,
    ) { }

    async execute(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findByUsername(
            createUserDto.username,
        );

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const passwordHash = await this.hashService.hash(createUserDto.password);

        const userData = {
            username: createUserDto.username,
            email: createUserDto.email,
            passwordHash,
        };

        return await this.userRepository.create(userData);
    }
}

