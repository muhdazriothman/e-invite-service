import {
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@common/services/jwt';
import { HashService } from '@common/services/hash';
import { UserRepository } from '@user/infra/repository';
import { LoginDto } from '@auth/interfaces/http/dtos/login';

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

        const isPasswordValid = await this.hashService.compare(
            loginDto.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return { token };
    }
}
