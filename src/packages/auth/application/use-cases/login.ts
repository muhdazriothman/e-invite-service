import {
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@shared/services/jwt';
import { HashService } from '@shared/services/hash';
import { UserRepository } from '@user/infra/repository';
import { LoginDto } from '@auth/interfaces/http/dtos/login';
import { JwtPayload } from '@auth/interfaces/http/strategies/jwt';

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,

        @Inject('HashService')
        private readonly hashService: HashService,

        @Inject('JwtService')
        private readonly jwtService: JwtService,
    ) { }

    async execute(loginDto: LoginDto): Promise<{ token: string }> {
        const user = await this.userRepository.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isDeleted) {
            throw new UnauthorizedException('Account has been deactivated');
        }

        const isPasswordValid = await this.hashService.compare(
            loginDto.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const jwtPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
            type: user.type,
        };

        const token = this.jwtService.sign(jwtPayload);

        return { token };
    }
}
