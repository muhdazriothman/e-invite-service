import { UserRepository } from '../../../infra/repositories/user/repository';
import { User } from '../../../domain/entities/user';
import { CreateUserDto } from '../create/dto';

export class CreateUser {
    constructor(private userRepository: UserRepository) { }

    async execute(dto: CreateUserDto): Promise<User> {
        const {
            username,
            password,
            role
        } = dto;

        const user = await User.create({
            username,
            password,
            role
        });

        return this.userRepository.create(user);
    }
}