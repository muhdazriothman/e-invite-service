import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { HashService } from '@shared/services/hash';
import { UserService } from '@user/application/services/user';
import {
    User,
    UserType,
} from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateAdminDto } from '@user/interfaces/http/dtos/create-admin';

@Injectable()
export class CreateAdminUseCase {
    constructor (
        private readonly userRepository: UserRepository,

        private readonly userService: UserService,
    ) { }

    async execute (
        createAdminDto: CreateAdminDto,
    ): Promise<User> {
        try {
            const {
                name,
                email,
                password,
            } = createAdminDto;

            await this.userService.validateSameEmailExists(email);

            const hashedPassword = await HashService.hash(password);

            const user = User.createNewAdmin({
                name,
                email,
                passwordHash: hashedPassword,
                type: UserType.ADMIN,
                paymentId: null,
            });

            return await this.userRepository.create(user);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}
