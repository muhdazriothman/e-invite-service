import { Invitation } from '@invitation/domain/entities/invitation';
import { InvitationRepository } from '@invitation/infra/repository';
import { Injectable } from '@nestjs/common';
import { PaginationResult } from '@shared/domain/value-objects/pagination-result';
import { User } from '@user/domain/entities/user';

@Injectable()
export class ListInvitationsUseCase {
    constructor (
        private readonly invitationRepository: InvitationRepository,
    ) { }

    async execute (
        user: User,
        next?: string,
        previous?: string,
        limit: number = 20,
    ): Promise<PaginationResult<Invitation>> {
        const {
            id: userId,
        } = user;

        return this.invitationRepository.findAllWithPagination(
            userId,
            next,
            previous,
            limit,
        );
    }
}
