import {
    Injectable,
    ExecutionContext,
    ForbiddenException,
    Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth';
import { UserAuthService } from '@user/application/services/user-auth.service';
import { JwtUser } from '@auth/interfaces/http/strategies/jwt';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
    constructor(
        @Inject('UserAuthService')
        private readonly userAuthService: UserAuthService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isJwtValid = await super.canActivate(context);
        if (!isJwtValid) {
            return false;
        }

        const request = context.switchToHttp().getRequest();
        const jwtUser = request.user as JwtUser;

        if (!jwtUser || !jwtUser.id) {
            throw new ForbiddenException('Admin access required');
        }

        const isAdmin = await this.userAuthService.isUserAdmin(jwtUser.id);
        if (!isAdmin) {
            throw new ForbiddenException('Admin access required');
        }

        const userAuthInfo = await this.userAuthService.getUserAuthInfo(jwtUser.id);
        if (userAuthInfo) {
            request.user = {
                id: userAuthInfo.id,
                email: userAuthInfo.email,
                type: userAuthInfo.type,
            };
        }

        return true;
    }
}
