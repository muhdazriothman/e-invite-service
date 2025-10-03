import { JwtPayload } from '@auth/interfaces/http/strategies/jwt';
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
    constructor (
        private readonly jwtService: NestJwtService,
    ) {}

    sign (
        payload: JwtPayload,
    ): string {
        return this.jwtService.sign(payload);
    }

    verify (
        token: string,
    ): JwtPayload {
        return this.jwtService.verify(token);
    }
}
