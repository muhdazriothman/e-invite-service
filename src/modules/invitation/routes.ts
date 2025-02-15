import { FastifyInstance } from 'fastify';

import { Service } from '../../service';

import { CreateInvitationController } from './controllers/create';

declare module 'fastify' {
    interface FastifyInstance {
        service: Service
    }
}

// eslint-disable-next-line require-await
export async function invitationRoutes(fastify: FastifyInstance): Promise<void> {
    const createController = CreateInvitationController.create({
        invitationRepository: fastify.service.invitationRepository
    });

    fastify.post('/invitation', createController.createInvitation);
}
