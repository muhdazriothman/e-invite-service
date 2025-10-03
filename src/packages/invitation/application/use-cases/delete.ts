import { InvitationService } from '@invitation/application/services/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@user/domain/entities/user';

@Injectable()
export class DeleteInvitationUseCase {
    constructor (
        private readonly invitationRepository: InvitationRepository,

        private readonly invitationService: InvitationService,
    ) { }

    async execute (
        user: User,
        id: string,
    ): Promise<void> {
        const {
            id: userId,
        } = user;

        try {
            await this.invitationService.findByIdAndUserIdOrFail(
                id,
                userId,
            );

            await this.invitationRepository.deleteByIdAndUserId(
                id,
                userId,
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }
}
