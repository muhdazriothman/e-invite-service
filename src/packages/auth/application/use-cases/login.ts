import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { JwtPayload } from '@auth/interfaces/http/strategies/jwt';
import {
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { authErrors } from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { JwtService } from '@shared/services/jwt';
import { UserRepository } from '@user/infra/repository';

@Injectable()
export class LoginUseCase {
    constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    @Inject('HashService')
    private readonly hashService: HashService,

    @Inject('JwtService')
    private readonly jwtService: JwtService,
    ) {}

    async execute(loginDto: LoginDto): Promise<{ token: string }> {
        const {
            email,
            password,
        } = loginDto;

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException(authErrors.INVALID_CREDENTIALS);
        }

        if (user.isDeleted) {
            throw new UnauthorizedException(authErrors.ACCOUNT_DEACTIVATED);
        }

        const isPasswordValid = await this.hashService.compare(
            password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(authErrors.INVALID_CREDENTIALS);
        }

        const jwtPayload: JwtPayload = {
            sub: user.id,
            email,
            type: user.type,
        };

        const token = this.jwtService.sign(jwtPayload);

        return { token };
    }
}
