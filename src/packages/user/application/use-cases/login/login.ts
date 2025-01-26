import { LoginUserDto } from './dto';
import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../infra/repositories/user/repository';
import { InvalidPayloadError } from '../../../../../shared/errors/error';

export class LoginUser {
    constructor(private userRepository: UserRepository) { }

    async execute(dto: LoginUserDto): Promise<User> {
        const {
            username,
            password
        } = dto;

        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new InvalidPayloadError('Invalid credentials');
        }

        const isValidPassword = user.validateUserPassword(password);
        if (!isValidPassword) {
            throw new InvalidPayloadError('Invalid credentials');
        }

        return user;
    }
}