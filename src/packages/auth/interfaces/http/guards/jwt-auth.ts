import { JwtUser } from '@auth/interfaces/http/strategies/jwt';
import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate (context: ExecutionContext) {
        return super.canActivate(context);
    }

    static handleRequest<TUser = JwtUser> (
        err: any,
        user: any,
    ): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user as TUser;
    }
}
