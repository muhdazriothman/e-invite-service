import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { JwtPayload } from '@auth/interfaces/http/strategies/jwt';
import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { authErrors } from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

@Injectable()
export class LoginUseCase {
    constructor (
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute (loginDto: LoginDto): Promise<{ token: string }> {
        const {
            email,
            password,
        } = loginDto;

        try {
            const user = await this.validateUser(email);

            await LoginUseCase.validatePassword(password, user);

            const jwtPayload: JwtPayload = {
                sub: user.id,
                email,
                type: user.type,
            };

            const token = this.jwtService.sign(jwtPayload);

            return { token };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }

    async validateUser (email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException(authErrors.INVALID_CREDENTIALS);
        }

        if (user.isDeleted) {
            throw new UnauthorizedException(authErrors.ACCOUNT_DEACTIVATED);
        }

        return user;
    }

    static async validatePassword (password: string, user: User): Promise<void> {
        const isPasswordValid = await HashService.compare(
            password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(authErrors.INVALID_CREDENTIALS);
        }
    }
}
