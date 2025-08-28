import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InvitationRepository } from '@invitation/infra/repository';
import { Invitation } from '@invitation/domain/entities/invitation';

@Injectable()
export class GetInvitationByIdUseCase {
    constructor(
        @Inject('InvitationRepository')
        private readonly invitationRepository: InvitationRepository,
    ) { }

    async execute(id: string): Promise<Invitation> {
        const invitation = await this.invitationRepository.findById(id);

        if (!invitation) {
            // TODO: throw machine readable error
            throw new NotFoundException('Invitation not found');
        }

        return invitation;
    }
}
