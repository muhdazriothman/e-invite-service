import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { JwtUser } from '@auth/interfaces/http/strategies/jwt';
import {
    Injectable,
    ExecutionContext,
    ForbiddenException,
    Inject,
} from '@nestjs/common';
import { authErrors } from '@shared/constants/error-codes';
import { UserAuthService } from '@user/application/services/user-auth.service';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
    constructor (
        @Inject('UserAuthService')
        private readonly userAuthService: UserAuthService,
    ) {
        super();
    }

    async canActivate (context: ExecutionContext): Promise<boolean> {
        const isJwtValid = await super.canActivate(context);
        if (!isJwtValid) {
            return false;
        }

        const request = context.switchToHttp().getRequest<{ user: JwtUser }>();
        const jwtUser = request.user;

        if (!jwtUser || !jwtUser.id) {
            throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
        }

        const isAdmin = await this.userAuthService.isUserAdmin(jwtUser.id);
        if (!isAdmin) {
            throw new ForbiddenException(authErrors.ADMIN_ACCESS_REQUIRED);
        }

        const userAuthInfo = await this.userAuthService.getUserAuthInfo(jwtUser.id);
        if (userAuthInfo) {
            (request as { user: any }).user = {
                id: userAuthInfo.id,
                email: userAuthInfo.email,
                type: userAuthInfo.type,
            };
        }

        return true;
    }
}
