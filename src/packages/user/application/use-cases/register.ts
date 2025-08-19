import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '@user/domain/repositories/user';
import { HashService } from '@user/application/interfaces/hash-service';
import { RegisterDto } from '@user/interfaces/http/dtos/register';
import { User } from '@user/domain/entities/user';

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        @Inject('HashService') private readonly hashService: HashService,
    ) { }

    async execute(dto: RegisterDto): Promise<User> {
        const { username, email, password } = dto;

        const existing = await this.userRepository.findByUsername(username);
        if (existing) {
            throw new ConflictException('Username already exists');
        }

        const passwordHash = await this.hashService.hash(password);
        const user = await this.userRepository.create({
            username,
            email,
            passwordHash,
        });

        return user;
    }
}
