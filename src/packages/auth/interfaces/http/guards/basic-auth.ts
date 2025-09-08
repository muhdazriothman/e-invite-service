import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { authErrors } from '../../../../shared/constants/error-codes';

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException(authErrors.BASIC_AUTH_REQUIRED);
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        const expectedUsername = this.configService.get<string>('ADMIN_CREATE_USERNAME');
        const expectedPassword = this.configService.get<string>('ADMIN_CREATE_PASSWORD');

        if (!expectedUsername || !expectedPassword) {
            throw new UnauthorizedException(authErrors.ADMIN_CREATION_CREDENTIALS_NOT_CONFIGURED);
        }

        if (username !== expectedUsername || password !== expectedPassword) {
            throw new UnauthorizedException(authErrors.INVALID_ADMIN_CREATION_CREDENTIALS);
        }

        return true;
    }
}
