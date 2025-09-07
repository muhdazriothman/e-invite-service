import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import {
    Injectable,
    Inject,
} from '@nestjs/common';
import { PaginationResult } from '@shared/domain/value-objects/pagination-result';

@Injectable()
export class ListInvitationsUseCase {
    constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,
    ) {}

    async execute(
        userId?: string,
        next?: string,
        previous?: string,
        limit: number = 20,
    ): Promise<PaginationResult<Invitation>> {
        return this.invitationRepository.findAllWithPagination(
            userId,
            next,
            previous,
            limit,
        );
    }
}
