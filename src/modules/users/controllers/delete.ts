import { FastifyRequest, FastifyReply } from 'fastify';
import { Service } from '../../../service';

import { DeleteUserDTO } from '../application/use-cases/delete/dto';
import { DeleteUserUseCase } from '../application/use-cases/delete/use-case';

export class DeleteUserController {
    private deleteUserUseCase: DeleteUserUseCase;

    constructor(deleteUserUseCase: DeleteUserUseCase) {
        if (!(deleteUserUseCase instanceof DeleteUserUseCase)) {
            throw new Error('deleteUserUseCase is not an instance of DeleteUserUseCase');
        }

        this.deleteUserUseCase = deleteUserUseCase;
    }

    static create(service: Service): DeleteUserController {
        const {
            userRepository,
        } = service;

        return new DeleteUserController(
            DeleteUserUseCase.create({
                userRepository,
            }),
        );
    }

    deleteUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const { id } = request.params as { id: string };

        const dto = DeleteUserDTO.create({
            id,
        });

        await this.deleteUserUseCase.execute(dto);

        return reply.send({
            message: 'User deleted successfully',
        });
    };
}
