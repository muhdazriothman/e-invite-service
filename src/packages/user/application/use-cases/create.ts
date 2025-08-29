import {
    Injectable,
    Inject,
    ConflictException,
} from '@nestjs/common';
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
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashService.hash(createUserDto.password);

        const user = User.createNew({
            name: createUserDto.name,
            email: createUserDto.email,
            passwordHash: hashedPassword,
            type: createUserDto.type,
            planType: createUserDto.planType,
        });

        return await this.userRepository.create(user);
    }
}

