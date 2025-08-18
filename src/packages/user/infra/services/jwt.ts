import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtService } from '@user/application/interfaces/jwt-service';

@Injectable()
export class JwtServiceImpl implements JwtService {
    constructor(private readonly jwtService: NestJwtService) { }

    sign(payload: any): string {
        return this.jwtService.sign(payload);
    }

    verify(token: string): any {
        return this.jwtService.verify(token);
    }
}
