import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InvitationRepository } from '@invitation/infra/repository';

@Injectable()
export class DeleteInvitationUseCase {
    constructor(
        @Inject('InvitationRepository')
        private readonly invitationRepository: InvitationRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const existingInvitation = await this.invitationRepository.findById(id);

        if (!existingInvitation) {
            throw new NotFoundException('Invitation not found');
        }

        const deleted = await this.invitationRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException('Failed to delete invitation');
        }
    }
}
