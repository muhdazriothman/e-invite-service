import { FastifyRequest, FastifyReply } from 'fastify';

import { plainToInstance } from 'class-transformer';

import { CreateInvitationDto } from '../application/use-cases/create/dto';
import { CreateInvitationUseCase } from '../application/use-cases/create/use-case';

import { InvitationMapper } from '../infra/mappers/invitation';
import { InvitationRepository } from '../infra/repositories/invitation/repository';

interface Service {
    invitationRepository: InvitationRepository;
}

export class CreateInvitationController {
    private createInvitationUseCase: CreateInvitationUseCase;

    constructor(createInvitationUseCase: CreateInvitationUseCase) {
        if (!(createInvitationUseCase instanceof CreateInvitationUseCase)) {
            throw new Error('createInvitationUseCase is not an instance of CreateInvitationUseCase');
        }

        this.createInvitationUseCase = createInvitationUseCase;
    }

    static create(service: Service): CreateInvitationController {
        const {
            invitationRepository
        } = service;

        return new CreateInvitationController(
            CreateInvitationUseCase.create({
                invitationRepository
            })
        );
    }

    createInvitation = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const dto = plainToInstance(CreateInvitationDto, request.body);

        const invitation = await this.createInvitationUseCase.execute(dto);

        const mappedInvitation = InvitationMapper.toDto(invitation);

        return reply.status(201).send({
            success: true,
            data : {
                invitation: mappedInvitation
            }
        });
    };
}
