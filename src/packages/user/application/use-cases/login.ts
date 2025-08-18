import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { LoginDto } from '@user/interfaces/http/dtos/login';
import { JwtService } from '@user/application/interfaces/jwt-service';
import { HashService } from '@user/application/interfaces/hash-service';
import { UserRepository } from '@user/domain/repositories/user';

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,

        @Inject('JwtService')
        private readonly jwtService: JwtService,

        @Inject('HashService')
        private readonly hashService: HashService
    ) { }

    async execute(loginDto: LoginDto) {
        const {
            username,
            password
        } = loginDto;

        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.hashService.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({ sub: user.id, username: user.username });

        return { accessToken: token };
    }
}
