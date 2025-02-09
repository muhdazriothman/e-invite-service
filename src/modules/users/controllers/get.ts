import { FastifyRequest, FastifyReply } from 'fastify';
import { Service } from '../../../service';

import { GetUserDTO } from '../application/use-cases/get/dto';
import { GetUserUseCase } from '../application/use-cases/get/use-case';
import { UserMapper } from '../infra/mappers/user';

export class GetUserController {
    private getUserUseCase: GetUserUseCase;

    constructor(getUserUseCase: GetUserUseCase) {
        if (!(getUserUseCase instanceof GetUserUseCase)) {
            throw new Error('getUserUseCase is not an instance of GetUserUseCase');
        }

        this.getUserUseCase = getUserUseCase;
    }

    static create(service: Service): GetUserController {
        const {
            userRepository,
        } = service;

        return new GetUserController(
            GetUserUseCase.create({
                userRepository,
            }),
        );
    }

    getUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const { id } = request.params as { id: string };

        const dto = GetUserDTO.create({
            id,
        });

        const user = await this.getUserUseCase.execute(dto);

        if (user === null) {
            return reply.status(404).send({ message: 'User not found' });
        }

        const mappedUser = UserMapper.toDTO(user);

        return reply.send({
            success: true,
            user: mappedUser,
        });
    };
}
