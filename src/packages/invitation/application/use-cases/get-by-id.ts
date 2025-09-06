import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class GetInvitationByIdUseCase {
  constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,
  ) {}

  async execute(id: string, userId?: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findById(id, userId);

    if (!invitation) {
      // TODO: throw machine readable error
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }
}
