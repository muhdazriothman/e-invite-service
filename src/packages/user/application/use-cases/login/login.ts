import jwt from 'jsonwebtoken';
import { LoginUserDto } from './dto';

import { UserRepository } from '../../../infra/repositories/user/repository';
import { InvalidPayloadError } from '../../../../../shared/errors/error';

export class LoginUser {
    constructor(private userRepository: UserRepository) { }

    async execute(dto: LoginUserDto): Promise<{ token: string }> {
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

        const token = await this.generateToken(user);

        return { token };
    }

    async generateToken(user: any): Promise<string> {
        return jwt.sign(
            {
                userId: user.id,
                username: user.username
            }, process.env.JWT_SECRET as string,
            {
                expiresIn: '1h'
            }
        );
    }
}