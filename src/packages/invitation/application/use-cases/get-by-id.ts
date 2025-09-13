import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { invitationErrors } from '@shared/constants/error-codes';

@Injectable()
export class GetInvitationByIdUseCase {
    constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,
    ) {}

    async execute(
        id: string,
        userId?: string,
    ): Promise<Invitation> {
        const invitation = await this.invitationRepository.findById(id, userId);
        if (!invitation) {
            throw new NotFoundException(invitationErrors.INVITATION_NOT_FOUND);
        }

        return invitation;
    }
}
