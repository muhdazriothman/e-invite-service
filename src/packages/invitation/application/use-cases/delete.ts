import { InvitationRepository } from '@invitation/infra/repository';
import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { invitationErrors } from '@shared/constants/error-codes';

@Injectable()
export class DeleteInvitationUseCase {
    constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,
    ) {}

    async execute(
        id: string,
        userId?: string,
    ): Promise<void> {
        const existingInvitation = await this.invitationRepository.findById(
            id,
            userId,
        );
        if (!existingInvitation) {
            throw new NotFoundException(invitationErrors.INVITATION_NOT_FOUND);
        }

        const deleted = await this.invitationRepository.delete(id, userId);
        if (!deleted) {
            throw new NotFoundException(invitationErrors.FAILED_TO_DELETE_INVITATION);
        }
    }
}
