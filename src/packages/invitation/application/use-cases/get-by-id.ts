import { InvitationService } from '@invitation/application/services/invitation';
import { Invitation } from '@invitation/domain/entities/invitation';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@user/domain/entities/user';

@Injectable()
export class GetInvitationByIdUseCase {
    constructor (
        private readonly invitationService: InvitationService,
    ) { }

    async execute (
        user: User,
        id: string,
    ): Promise<Invitation> {
        try {
            const invitation = await this.invitationService.findByIdAndUserIdOrFail(
                id,
                user.id,
            );

            return invitation;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}
