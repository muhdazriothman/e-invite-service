import {
    Injectable,
    Inject,
} from '@nestjs/common';
import { InvitationRepository } from '@invitation/infra/repository';
import { Invitation } from '@invitation/domain/entities/invitation';

@Injectable()
export class ListInvitationsUseCase {
    constructor(
        @Inject('InvitationRepository')
        private readonly invitationRepository: InvitationRepository,
    ) { }

    async execute(userId?: string): Promise<Invitation[]> {
        return await this.invitationRepository.findAll(userId);
    }
}
