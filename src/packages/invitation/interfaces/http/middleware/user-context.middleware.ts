import { JwtUser } from '@auth/interfaces/http/strategies/jwt';
import {
    Injectable,
    NestMiddleware,
    BadRequestException,
} from '@nestjs/common';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import {
    Request,
    Response,
    NextFunction,
} from 'express';

export interface RequestWithUser extends Request {
  user: JwtUser;
  userData: User;
}

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
    constructor(private readonly userRepository: UserRepository) {}

    async use(req: RequestWithUser, res: Response, next: NextFunction) {
        const userId = req.user?.id;

        if (!userId) {
            throw new BadRequestException('User ID not found in request');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        req.userData = user;

        next();
    }
}
