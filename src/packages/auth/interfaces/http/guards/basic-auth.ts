import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException('Basic authentication required');
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        const expectedUsername = this.configService.get<string>('ADMIN_CREATE_USERNAME');
        const expectedPassword = this.configService.get<string>('ADMIN_CREATE_PASSWORD');

        if (!expectedUsername || !expectedPassword) {
            throw new UnauthorizedException('Admin creation credentials not configured');
        }

        if (username !== expectedUsername || password !== expectedPassword) {
            throw new UnauthorizedException('Invalid admin creation credentials');
        }

        return true;
    }
}
