import {
    Injectable,
    Inject,
    ConflictException,
} from '@nestjs/common';
import { HashService } from '@shared/services/hash';
import {
    User,
    UserType,
} from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';

@Injectable()
export class CreateAdminUseCase {
    constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    @Inject('HashService')
    private readonly hashService: HashService,
    ) {}

    async execute(createAdminDto: CreateAdminDto): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(
            createAdminDto.email,
        );
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashService.hash(createAdminDto.password);

        const user = User.createNewAdmin({
            name: createAdminDto.name,
            email: createAdminDto.email,
            passwordHash: hashedPassword,
            type: UserType.ADMIN,
            paymentId: null,
        });

        return await this.userRepository.create(user);
    }
}
